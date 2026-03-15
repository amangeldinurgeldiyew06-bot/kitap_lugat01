import MixinStorage "blob-storage/Mixin";
import Map "mo:core/Map";
import Array "mo:core/Array";
import VarArray "mo:core/VarArray";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Nat32 "mo:core/Nat32";
import Char "mo:core/Char";
import Random "mo:core/Random";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";



actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  public type UserProfile = {
    name : Text;
  };

  public type Dictionary = {
    owner : Principal;
    name : Text;
    sourceLanguage : Text;
    targetLanguage : Text;
    wordPairs : [(Text, Text)];
    unknownWords : [Text];
    favoriteWords : [Text];
    quizPosition : Nat;
  };

  public type QuizQuestion = {
    question : Text;
    options : [(Text, Text)];
    correctAnswerIndex : Nat;
  };

  // User profiles storage
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Persistent storage for dictionaries (dictionary array)
  var dictionaries : [(Text, Principal, Dictionary)] = [];

  // User profile functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Helper function to verify dictionary ownership
  private func verifyDictionaryOwnership(caller : Principal, owner : Principal) : Bool {
    caller == owner or AccessControl.isAdmin(accessControlState, caller);
  };

  public shared ({ caller }) func createDictionary(name : Text, sourceLanguage : Text, targetLanguage : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create dictionaries");
    };

    // Check if dictionary already exists for this user
    let existing = dictionaries.find(func((dictName, owner, _)) { dictName == name and owner == caller });
    if (existing != null) {
      Runtime.trap("A dictionary with this name already exists");
    };

    let newDictionary : Dictionary = {
      owner = caller;
      name;
      sourceLanguage;
      targetLanguage;
      wordPairs = [];
      unknownWords = [];
      favoriteWords = [];
      quizPosition = 0;
    };

    dictionaries := dictionaries.concat([(name, caller, newDictionary)]);
  };

  public shared ({ caller }) func addWordPair(dictionaryName : Text, sourceWord : Text, translation : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can add word pairs");
    };

    switch (dictionaries.find(func((dictName, owner, _)) { dictName == dictionaryName and owner == caller })) {
      case (null) {
        Runtime.trap("Dictionary not found or access denied");
      };
      case (?(dictName, owner, dictionary)) {
        if (not verifyDictionaryOwnership(caller, owner)) {
          Runtime.trap("Unauthorized: You can only modify your own dictionaries");
        };

        let existingPair = dictionary.wordPairs.find(func((word, _)) { word == sourceWord });
        if (existingPair != null) {
          Runtime.trap("This word already exists in the dictionary");
        };

        let updatedDictionary = {
          owner = dictionary.owner;
          name = dictionary.name;
          sourceLanguage = dictionary.sourceLanguage;
          targetLanguage = dictionary.targetLanguage;
          wordPairs = dictionary.wordPairs.concat([(sourceWord, translation)]);
          unknownWords = dictionary.unknownWords;
          favoriteWords = dictionary.favoriteWords;
          quizPosition = dictionary.quizPosition;
        };

        let mutableDictionaries : [var (Text, Principal, Dictionary)] = dictionaries.toVarArray();
        let index = mutableDictionaries.findIndex(func((name, o, _)) { name == dictionaryName and o == caller });
        switch (index) {
          case (null) {
            Runtime.trap("Internal error: Dictionary index not found");
          };
          case (?i) {
            mutableDictionaries[i] := (dictName, owner, updatedDictionary);
            dictionaries := mutableDictionaries.toArray();
          };
        };
      };
    };
  };

  public shared ({ caller }) func removeWordPair(dictionaryName : Text, sourceWord : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can remove word pairs");
    };

    switch (dictionaries.find(func((dictName, owner, _)) { dictName == dictionaryName and owner == caller })) {
      case (null) {
        Runtime.trap("Dictionary not found or access denied");
      };
      case (?(dictName, owner, dictionary)) {
        if (not verifyDictionaryOwnership(caller, owner)) {
          Runtime.trap("Unauthorized: You can only modify your own dictionaries");
        };

        let filteredPairs = dictionary.wordPairs.filter(
          func((word, _)) { word != sourceWord }
        );
        let updatedDictionary = {
          owner = dictionary.owner;
          name = dictionary.name;
          sourceLanguage = dictionary.sourceLanguage;
          targetLanguage = dictionary.targetLanguage;
          wordPairs = filteredPairs;
          unknownWords = dictionary.unknownWords;
          favoriteWords = dictionary.favoriteWords;
          quizPosition = dictionary.quizPosition;
        };

        let mutableDictionaries : [var (Text, Principal, Dictionary)] = dictionaries.toVarArray();
        let index = mutableDictionaries.findIndex(func((name, o, _)) { name == dictionaryName and o == caller });
        switch (index) {
          case (null) {
            Runtime.trap("Internal error: Dictionary index not found");
          };
          case (?i) {
            mutableDictionaries[i] := (dictName, owner, updatedDictionary);
            dictionaries := mutableDictionaries.toArray();
          };
        };
      };
    };
  };

  public shared ({ caller }) func updateWordPair(dictionaryName : Text, originalWord : Text, newWord : Text, newTranslation : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can update word pairs");
    };

    switch (dictionaries.find(func((dictName, owner, _)) { dictName == dictionaryName and owner == caller })) {
      case (null) {
        Runtime.trap("Dictionary not found or access denied");
      };
      case (?(dictName, owner, dictionary)) {
        if (not verifyDictionaryOwnership(caller, owner)) {
          Runtime.trap("Unauthorized: You can only modify your own dictionaries");
        };

        let updatedPairs = dictionary.wordPairs.map(
          func((word, translation)) {
            if (word == originalWord) { (newWord, newTranslation) } else {
              (word, translation);
            };
          }
        );
        let updatedDictionary = {
          owner = dictionary.owner;
          name = dictionary.name;
          sourceLanguage = dictionary.sourceLanguage;
          targetLanguage = dictionary.targetLanguage;
          wordPairs = updatedPairs;
          unknownWords = dictionary.unknownWords;
          favoriteWords = dictionary.favoriteWords;
          quizPosition = dictionary.quizPosition;
        };

        let mutableDictionaries : [var (Text, Principal, Dictionary)] = dictionaries.toVarArray();
        let index = mutableDictionaries.findIndex(func((name, o, _)) { name == dictionaryName and o == caller });
        switch (index) {
          case (null) {
            Runtime.trap("Internal error: Dictionary index not found");
          };
          case (?i) {
            mutableDictionaries[i] := (dictName, owner, updatedDictionary);
            dictionaries := mutableDictionaries.toArray();
          };
        };
      };
    };
  };

  public query ({ caller }) func getAllDictionaries() : async [Dictionary] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view dictionaries");
    };

    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    dictionaries
      .filter(func((_, owner, _)) { isAdmin or owner == caller })
      .map(
        func((_, _, dict)) {
          {
            owner = dict.owner;
            name = dict.name;
            sourceLanguage = dict.sourceLanguage;
            targetLanguage = dict.targetLanguage;
            wordPairs = dict.wordPairs;
            unknownWords = dict.unknownWords;
            favoriteWords = dict.favoriteWords;
            quizPosition = dict.quizPosition;
          };
        }
      );
  };

  public query ({ caller }) func getDictionary(name : Text) : async ?Dictionary {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view dictionaries");
    };

    let result = dictionaries.find(func((dictName, owner, _)) { dictName == name and owner == caller });
    switch (result) {
      case (null) { null };
      case (?(dictName, owner, dict)) {
        if (not verifyDictionaryOwnership(caller, owner)) {
          Runtime.trap("Unauthorized: You can only view your own dictionaries");
        };
        ?{
          owner = dict.owner;
          name = dict.name;
          sourceLanguage = dict.sourceLanguage;
          targetLanguage = dict.targetLanguage;
          wordPairs = dict.wordPairs;
          unknownWords = dict.unknownWords;
          favoriteWords = dict.favoriteWords;
          quizPosition = dict.quizPosition;
        };
      };
    };
  };

  public shared ({ caller }) func markWordAsUnknown(dictionaryName : Text, word : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can mark words as unknown");
    };

    switch (dictionaries.find(func((dictName, owner, _)) { dictName == dictionaryName and owner == caller })) {
      case (null) {
        Runtime.trap("Dictionary not found or access denied");
      };
      case (?(dictName, owner, dictionary)) {
        if (not verifyDictionaryOwnership(caller, owner)) {
          Runtime.trap("Unauthorized: You can only modify your own dictionaries");
        };

        let exists = dictionary.unknownWords.find(func(w) { w == word });
        let updatedUnknownWords = switch (exists) {
          case (null) {
            dictionary.unknownWords.concat([word]);
          };
          case (?_) { dictionary.unknownWords };
        };

        let updatedDictionary = {
          owner = dictionary.owner;
          name = dictionary.name;
          sourceLanguage = dictionary.sourceLanguage;
          targetLanguage = dictionary.targetLanguage;
          wordPairs = dictionary.wordPairs;
          unknownWords = updatedUnknownWords;
          favoriteWords = dictionary.favoriteWords;
          quizPosition = dictionary.quizPosition;
        };

        let mutableDictionaries : [var (Text, Principal, Dictionary)] = dictionaries.toVarArray();
        let index = mutableDictionaries.findIndex(func((name, o, _)) { name == dictionaryName and o == caller });
        switch (index) {
          case (null) {
            Runtime.trap("Internal error: Dictionary index not found");
          };
          case (?i) {
            mutableDictionaries[i] := (dictName, owner, updatedDictionary);
            dictionaries := mutableDictionaries.toArray();
          };
        };
      };
    };
  };

  public shared ({ caller }) func removeWordFromUnknown(dictionaryName : Text, word : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can remove words from unknown");
    };

    switch (dictionaries.find(func((dictName, owner, _)) { dictName == dictionaryName and owner == caller })) {
      case (null) {
        Runtime.trap("Dictionary not found or access denied");
      };
      case (?(dictName, owner, dictionary)) {
        if (not verifyDictionaryOwnership(caller, owner)) {
          Runtime.trap("Unauthorized: You can only modify your own dictionaries");
        };

        let filteredUnknownWords = dictionary.unknownWords.filter(
          func(w) { w != word }
        );
        let updatedDictionary = {
          owner = dictionary.owner;
          name = dictionary.name;
          sourceLanguage = dictionary.sourceLanguage;
          targetLanguage = dictionary.targetLanguage;
          wordPairs = dictionary.wordPairs;
          unknownWords = filteredUnknownWords;
          favoriteWords = dictionary.favoriteWords;
          quizPosition = dictionary.quizPosition;
        };

        let mutableDictionaries : [var (Text, Principal, Dictionary)] = dictionaries.toVarArray();
        let index = mutableDictionaries.findIndex(func((name, o, _)) { name == dictionaryName and o == caller });
        switch (index) {
          case (null) {
            Runtime.trap("Internal error: Dictionary index not found");
          };
          case (?i) {
            mutableDictionaries[i] := (dictName, owner, updatedDictionary);
            dictionaries := mutableDictionaries.toArray();
          };
        };
      };
    };
  };

  public shared ({ caller }) func toggleFavoriteWord(dictionaryName : Text, word : Text) : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can modify favorites");
    };

    switch (dictionaries.find(func((dictName, owner, _)) { dictName == dictionaryName and owner == caller })) {
      case (null) {
        Runtime.trap("Dictionary not found or access denied");
      };
      case (?(dictName, owner, dictionary)) {
        if (not verifyDictionaryOwnership(caller, owner)) {
          Runtime.trap("Unauthorized: You can only modify your own dictionaries");
        };

        let isFavorite = dictionary.favoriteWords.find(func(w) { w == word }) != null;
        let updatedFavorites = if (isFavorite) {
          dictionary.favoriteWords.filter(func(w) { w != word });
        } else {
          dictionary.favoriteWords.concat([word]);
        };

        let updatedDictionary = {
          owner = dictionary.owner;
          name = dictionary.name;
          sourceLanguage = dictionary.sourceLanguage;
          targetLanguage = dictionary.targetLanguage;
          wordPairs = dictionary.wordPairs;
          unknownWords = dictionary.unknownWords;
          favoriteWords = updatedFavorites;
          quizPosition = dictionary.quizPosition;
        };

        let mutableDictionaries : [var (Text, Principal, Dictionary)] = dictionaries.toVarArray();
        let index = mutableDictionaries.findIndex(func((name, o, _)) { name == dictionaryName and o == caller });
        switch (index) {
          case (null) {
            Runtime.trap("Internal error: Dictionary index not found");
          };
          case (?i) {
            mutableDictionaries[i] := (dictName, owner, updatedDictionary);
            dictionaries := mutableDictionaries.toArray();
          };
        };

        not isFavorite;
      };
    };
  };

  public shared ({ caller }) func getQuizQuestion(dictionaryName : Text) : async ?QuizQuestion {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can take quizzes");
    };

    let dictResult = dictionaries.find(func((dictName, owner, _)) { dictName == dictionaryName and owner == caller });
    switch (dictResult) {
      case (null) { null };
      case (?(dictName, owner, dictionary)) {
        if (not verifyDictionaryOwnership(caller, owner)) {
          Runtime.trap("Unauthorized: You can only quiz on your own dictionaries");
        };

        if (dictionary.wordPairs.size() == 0) {
          return null;
        };

        let questionIndex = dictionary.quizPosition;
        let correctPair = dictionary.wordPairs[questionIndex];

        var options = [ correctPair ];

        let incorrectOptions = dictionary.wordPairs.filter(
          func((w, _)) { w != correctPair.0 }
        );

        let numIncorrect = Nat.min(3, incorrectOptions.size());
        options := [ correctPair ]
          .concat(incorrectOptions.sliceToArray(0, numIncorrect));

        let question : QuizQuestion = {
          question = correctPair.0;
          options = options;
          correctAnswerIndex = 0;
        };

        let newPosition = if (questionIndex + 1 >= dictionary.wordPairs.size()) { 0 } else {
          questionIndex + 1;
        };

        let updatedDictionary = {
          owner = dictionary.owner;
          name = dictionary.name;
          sourceLanguage = dictionary.sourceLanguage;
          targetLanguage = dictionary.targetLanguage;
          wordPairs = dictionary.wordPairs;
          unknownWords = dictionary.unknownWords;
          favoriteWords = dictionary.favoriteWords;
          quizPosition = newPosition;
        };

        let mutableDictionaries : [var (Text, Principal, Dictionary)] = dictionaries.toVarArray();
        let index = mutableDictionaries.findIndex(func((name, o, _)) { name == dictName and o == owner });
        switch (index) {
          case (null) {
            Runtime.trap("Internal error: Dictionary index not found");
          };
          case (?i) {
            mutableDictionaries[i] := (dictName, owner, updatedDictionary);
            dictionaries := mutableDictionaries.toArray();
          };
        };

        ?question;
      };
    };
  };

  public shared ({ caller }) func getUnknownQuizQuestion(dictionaryName : Text) : async ?QuizQuestion {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can take quizzes");
    };

    let dictResult = dictionaries.find(func((dictName, owner, _)) { dictName == dictionaryName and owner == caller });
    switch (dictResult) {
      case (null) { null };
      case (?(dictName, owner, dictionary)) {
        if (not verifyDictionaryOwnership(caller, owner)) {
          Runtime.trap("Unauthorized: You can only quiz on your own dictionaries");
        };

        if (dictionary.unknownWords.size() == 0) {
          return null;
        };

        let questionIndex = 0;
        let correctWord = dictionary.unknownWords[questionIndex];

        let correctPair = dictionary.wordPairs.find(func((word, _)) { word == correctWord });
        switch (correctPair) {
          case (null) { null };
          case (?(word, translation)) {
            var options = [ (word, translation) ];

            let availableIncorrect = dictionary.wordPairs.filter(
              func((w, _)) { w != word }
            );
            let numIncorrect = Nat.min(3, availableIncorrect.size());
            options := [ (word, translation) ]
              .concat(availableIncorrect.sliceToArray(0, numIncorrect));

            let question : QuizQuestion = {
              question = word;
              options = options;
              correctAnswerIndex = 0;
            };

            ?question;
          };
        };
      };
    };
  };

  public shared ({ caller }) func getFavoriteQuizQuestion(dictionaryName : Text) : async ?QuizQuestion {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can take quizzes");
    };

    let dictResult = dictionaries.find(func((dictName, owner, _)) { dictName == dictionaryName and owner == caller });
    switch (dictResult) {
      case (null) { null };
      case (?(dictName, owner, dictionary)) {
        if (not verifyDictionaryOwnership(caller, owner)) {
          Runtime.trap("Unauthorized: You can only quiz on your own dictionaries");
        };

        if (dictionary.favoriteWords.size() == 0) {
          return null;
        };

        let questionIndex = 0;
        let correctWord = dictionary.favoriteWords[questionIndex];

        let correctPair = dictionary.wordPairs.find(func((word, _)) { word == correctWord });
        switch (correctPair) {
          case (null) { null };
          case (?(word, translation)) {
            var options = [ (word, translation) ];

            let availableIncorrect = dictionary.wordPairs.filter(
              func((w, _)) { w != word }
            );
            let numIncorrect = Nat.min(3, availableIncorrect.size());
            options := [ (word, translation) ]
              .concat(availableIncorrect.sliceToArray(0, numIncorrect));

            let question : QuizQuestion = {
              question = word;
              options = options;
              correctAnswerIndex = 0;
            };

            ?question;
          };
        };
      };
    };
  };

  public shared ({ caller }) func bulkImportWordPairs(dictionaryName : Text, input : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can bulk import");
    };

    switch (dictionaries.find(func((dictName, owner, _)) { dictName == dictionaryName and owner == caller })) {
      case (null) {
        Runtime.trap("Dictionary not found or access denied");
      };
      case (?(dictName, owner, dictionary)) {
        if (not verifyDictionaryOwnership(caller, owner)) {
          Runtime.trap("Unauthorized: You can only modify your own dictionaries");
        };

        let lines = input.split(#char '\n');
        let wordPairs = lines.toArray().map(
          func(line) {
            let parts = line.split(#char '-').toArray();
            if (parts.size() == 2) {
              (parts[0], parts[1]);
            } else { ("", "") };
          }
        );

        let validWordPairs = wordPairs.filter(
          func((word, translation)) {
            word != "" and translation != "";
          }
        );

        let updatedDictionary = {
          owner = dictionary.owner;
          name = dictionary.name;
          sourceLanguage = dictionary.sourceLanguage;
          targetLanguage = dictionary.targetLanguage;
          wordPairs = dictionary.wordPairs.concat(validWordPairs);
          unknownWords = dictionary.unknownWords;
          favoriteWords = dictionary.favoriteWords;
          quizPosition = dictionary.quizPosition;
        };

        let mutableDictionaries : [var (Text, Principal, Dictionary)] = dictionaries.toVarArray();
        let index = mutableDictionaries.findIndex(func((name, o, _)) { name == dictionaryName and o == caller });
        switch (index) {
          case (null) {
            Runtime.trap("Internal error: Dictionary index not found");
          };
          case (?i) {
            mutableDictionaries[i] := (dictName, owner, updatedDictionary);
            dictionaries := mutableDictionaries.toArray();
          };
        };
      };
    };
  };
};
