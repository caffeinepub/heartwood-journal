import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Text "mo:core/Text";

module {
  // Old DiaryEntry without videoBlobIds and audioBlobIds
  type OldDiaryEntry = {
    id : Text;
    date : Text;
    timestamp : Int;
    content : Text;
    mood : Text;
    moodEmoji : Text;
    tags : [Text];
    photoBlobIds : [Text];
  };

  type OldUserEntries = {
    entries : Map.Map<Text, OldDiaryEntry>;
  };

  type OldActor = {
    userEntries : Map.Map<Principal, OldUserEntries>;
  };

  // New DiaryEntry with videoBlobIds and audioBlobIds
  type NewDiaryEntry = {
    id : Text;
    date : Text;
    timestamp : Int;
    content : Text;
    mood : Text;
    moodEmoji : Text;
    tags : [Text];
    photoBlobIds : [Text];
    videoBlobIds : [Text];
    audioBlobIds : [Text];
  };

  type NewUserEntries = {
    entries : Map.Map<Text, NewDiaryEntry>;
  };

  type NewActor = {
    userEntries : Map.Map<Principal, NewUserEntries>;
  };

  // Migration function
  public func run(old : OldActor) : NewActor {
    let newUserEntries = old.userEntries.map<Principal, OldUserEntries, NewUserEntries>(
      func(_principal, oldUserEntries) {
        let newEntries = oldUserEntries.entries.map<Text, OldDiaryEntry, NewDiaryEntry>(
          func(_id, oldEntry) {
            { oldEntry with videoBlobIds = []; audioBlobIds = [] };
          }
        );
        { entries = newEntries };
      }
    );
    { userEntries = newUserEntries };
  };
};
