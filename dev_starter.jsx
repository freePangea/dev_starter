Tags = new Mongo.Collection("tags");
Purchases = new Mongo.Collection("purchases");
CustomUsers = new Mongo.Collection("customUsers");


//better way than createing 2 collections?
Payers = new Mongo.Collection("payers")
Receivers = new Mongo.Collection("receivers")
Groups = new Mongo.Collection("groups")


if (Meteor.isClient) {
  // counter starts at 0

  Meteor.subscribe("tags");
//  Meteor.subscribe("customUsers");

  Meteor.startup(function(){
    React.render(<App />, document.getElementById("render-app"));
  });

  Template.body.helpers({
    average: function(){
      return Meteor.call("calculateMeanValue");
    }
  });
  Template.body.events({
    "click .ui.dropdown": function(){
      $(".ui.dropdown").dropdown();
  }
  });

}

if (Meteor.isServer) {
  Meteor.publish("tags");
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
