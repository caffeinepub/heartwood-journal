import Map "mo:core/Map";
import Set "mo:core/Set";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";


// Specify the data migration function in with-clause

actor {
  // Prep modules
  include MixinStorage();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Diary Entry Type
  public type DiaryEntry = {
    id : Text;
    date : Text;
    timestamp : Int;
    content : Text;
    mood : Text;
    moodEmoji : Text;
    tags : [Text];
    photoBlobIds : [Text];
    videoBlobIds : [Text]; // New field for video attachments
    audioBlobIds : [Text]; // New field for audio attachments
  };

  public type UserEntries = {
    entries : Map.Map<Text, DiaryEntry>;
  };

  let userEntries = Map.empty<Principal, UserEntries>();

  // Create Entry
  public shared ({ caller }) func createEntry(entry : DiaryEntry) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create diary entries");
    };

    let entries = switch (userEntries.get(caller)) {
      case (null) {
        let newEntries = Map.empty<Text, DiaryEntry>();
        userEntries.add(caller, { entries = newEntries });
        newEntries;
      };
      case (?userEntries) { userEntries.entries };
    };

    if (entries.containsKey(entry.id)) {
      Runtime.trap("Entry with this ID already exists");
    };

    entries.add(entry.id, entry);
  };

  // Get Entries By Date
  public query ({ caller }) func getEntriesByDate(date : Text) : async [DiaryEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can retrieve diary entries");
    };

    let entries = switch (userEntries.get(caller)) {
      case (null) { Map.empty<Text, DiaryEntry>() };
      case (?userEntries) { userEntries.entries };
    };

    entries.values().toArray().filter(
      func(entry) { entry.date == date }
    );
  };

  // Get All Entries
  public query ({ caller }) func getAllEntries() : async [DiaryEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can retrieve diary entries");
    };

    let entries = switch (userEntries.get(caller)) {
      case (null) { Map.empty<Text, DiaryEntry>() };
      case (?userEntries) { userEntries.entries };
    };

    entries.values().toArray();
  };

  // Get All Dates With Entries
  public query ({ caller }) func getAllDatesWithEntries() : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can retrieve diary entries");
    };

    let entries = switch (userEntries.get(caller)) {
      case (null) { Map.empty<Text, DiaryEntry>() };
      case (?userEntries) { userEntries.entries };
    };

    let datesSet = Set.empty<Text>();
    entries.values().forEach(
      func(entry) {
        if (not datesSet.contains(entry.date)) {
          datesSet.add(entry.date);
        };
      }
    );
    datesSet.values().toArray();
  };

  // Update Entry
  public shared ({ caller }) func updateEntry(entry : DiaryEntry) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update diary entries");
    };

    switch (userEntries.get(caller)) {
      case (null) { Runtime.trap("No entries found for this user") };
      case (?userEntries) {
        if (not userEntries.entries.containsKey(entry.id)) {
          Runtime.trap("Entry with this ID does not exist");
        };
        userEntries.entries.add(entry.id, entry);
      };
    };
  };

  // Delete Entry
  public shared ({ caller }) func deleteEntry(entryId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete diary entries");
    };

    switch (userEntries.get(caller)) {
      case (null) { Runtime.trap("No entries found for this user") };
      case (?userEntries) {
        if (not userEntries.entries.containsKey(entryId)) {
          Runtime.trap("Entry with this ID does not exist");
        };
        userEntries.entries.remove(entryId);
      };
    };
  };
};
