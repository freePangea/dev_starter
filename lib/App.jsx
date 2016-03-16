App = React.createClass({

  mixins:[ReactMeteorData],

  getMeteorData(){
    return{
      tags: Tags.find().fetch()
    }
  },

  handleSubmit(event){
    event.preventDefault();

    var tag = React.findDOMNode(this.refs.tagInput).value.trim();
    var price = parseInt(React.findDOMNode(this.refs.priceInput).value, 10);
    var user = React.findDOMNode(this.refs.userNameInput).value.trim();
    var group = React.findDOMNode(this.refs.groupInput).value.trim();
    if(tag == ""){
      Meteor.call("addUser", user);
      React.findDOMNode(this.refs.userNameInput).value="";
      return;
    }
    Meteor.call("addTag", tag);
    Meteor.call("addPurchase", tag, price, user, group);
    Meteor.call("addGroup", user, group);


    React.findDOMNode(this.refs.tagInput).value="";
    React.findDOMNode(this.refs.priceInput).value="";
    React.findDOMNode(this.refs.userNameInput).value="";
    React.findDOMNode(this.refs.groupInput).value="";
  },
  handleSubmitGroup(event){
    event.preventDefault();
    var group = React.findDOMNode(this.refs.gInput).value.trim();
    var month = React.findDOMNode(this.refs.monthInput).value.trim();

    Meteor.call("calculateDue", group, month);

    React.findDOMNode(this.refs.gInput).value="";
  },

  renderDropDown(){
    return this.data.tags.map((tag) => {
      return <Dropdown key={tag._id} tag = {tag} />;
    });

  },

  calcMean(){
    Meteor.call("calculateMeanValue");
  },

  calcDue(){
    Meteor.call("calculateDue");
  },

  resetBalance(){
    Meteor.call("resetBalance");
  },


/*NOTE: to insert a User in the DB, fill the username in the form and leave tag empty
        Choose the group, you want to share the payment with, at input. If the Group doesn't exist yet, a new one gets created and the Users is it's only member
          If the group already exist, the User will be added to the group, if he's not already in

          calcDue and calcMean are not supported anymore, used to compute for whole DB (without group support)

          To calculate due, enter the groupname and the month (default is whole year) in the 2nd form. Results get printed on server console

          After each calculation of due, you can check the db.customUsers.find() in the mongo shell. Each user has the balance of the last calculation -> verify results if necessary
*/
render(){
return(
  <div className="container">

  <form className="ui form" onSubmit={this.handleSubmit}>
    <div className="field">
      <label>Username</label>
      <input type="text" ref="userNameInput" placeholder="for now insert username" />
    </div>
    <div className="field">
      <label>Tag</label>
      <input type="text" ref="tagInput" placeholder="Please enter Tag" />
    </div>
    <div className="field">
      <label>Price</label>
      <input type="number" ref="priceInput" placeholder="Please enter price" />
    </div>
    <div className="field">
      <label>Group</label>
      <input type="text" ref="groupInput" placeholder="Please enter the Group(name), you want to contribute this payment" />
    </div>
    <button className="ui button" type="submit">Submit</button>
    <button className="ui button green" onClick={this.calcMean}>Calc</button>
    <button className="ui button red" onClick={this.calcDue}>Due</button>
    <button className="ui button pink" onClick={this.resetBalance}>ResetBalance</button>
  </form>
  <form className="ui form" onSubmit={this.handleSubmitGroup}>
    <div className="field">
      <label>Enter Group</label>
      <input type="text" ref="gInput" placeholder="Enter Groupname for which you would like to calculate Due" />
    </div>
    <div className="ui selection dropdown">
      <input name="month" ref="monthInput" type="hidden">
      <i className="dropdown icon"></i>
      <div className="default text">Month</div>
      <div className="menu">
        <div className="item" data-value="1">January</div>
        <div className="item" data-value="2">February</div>
        <div className="item" data-value="3">March</div>
        <div className="item" data-value="4">April</div>
        <div className="item" data-value="5">Mai</div>
        <div className="item" data-value="6">June</div>
        <div className="item" data-value="7">July</div>
        <div className="item" data-value="8">August</div>
        <div className="item" data-value="9">September</div>
        <div className="item" data-value="10">October</div>
        <div className="item" data-value="11">November</div>
        <div className="item" data-value="12">December</div>
      </div>
      </input>
    </div>
    <button className="ui button green" type="submit">Submit</button>
  </form>
  </div>
  );
}

});
