Meteor.methods({
    logToConsole(msg){
      console.log(msg)
    },
    addTag(tag){
      //require unique Tags -> duplicates only in Purchase DB
      //don't link prices and tags in same DB -> can be cheaper anytime
      if(!Tags.findOne({name: tag})){
        Tags.insert({
          name: tag,
          createdAt: new Date()
        })
      }
      else{
        console.log("Tag already in DB");
      }
    },
    addUser(user){
      if(user /= ""){
      CustomUsers.insert({
        username: user,
        balance: 0,
        createdAt: new Date()
      })
    }
    },
    addGroup(user, name){
      var uId = CustomUsers.findOne({username: user})._id
      var blubb = Groups.findOne({groupname: name})
      if(!blubb)
      {//new group
        Groups.insert({
          groupname: name,
          users: [uId],
          createdAt: new Date()
        })
      }else{
        Groups.update({groupname: name},{$addToSet: {users: uId}})
      }
    },
    addPurchase(tag, price, user, group){
      if(user == ""){ return }
      Purchases.insert({
          user: user,
          tag: tag,
          price: price,
          group: group,
          createdAt: new Date()
        })
        if(!CustomUsers.findOne({username: user})){
          CustomUsers.insert({
            username: user,
            balance: 0,
            createdAt: new Date()
          })
        }
    },
    //explicitly update balance for calculating mean and Due
    calculateMeanValue(group, m){
      Meteor.call("resetBalance")
      var start, stop, month
      //only for 2016 (for now)
      switch(m){
        case "1": {start = "2016-01-01T00:00:00Z";
                stop = "2016-01-31T23:59:59Z";
                month = "January";
                break;}
        case "2":{start = "2016-02-01T00:00:00Z";
                stop = "2016-02-29T23:59:59Z";
                month = "February";
                break;}
        case "3":{start = "2016-03-01T00:00:00Z";
                stop = "2016-03-31T23:59:59Z";
                month ="March";
                break;}
        case "4":{start = "2016-04-01T00:00:00Z";
                stop = "2016-04-30T23:59:59Z";
                month = "April";
                break;}
        case "5":{start = "2016-05-01T00:00:00Z";
                stop = "2016-05-31T23:59:59Z";
                month = "Mai";
                break;}
        case "6":{start = "2016-06-01T00:00:00Z";
                stop = "2016-06-30T23:59:59Z";
                month ="June";
                break;}
        case "7":{start = "2016-07-01T00:00:00Z";
                stop = "2016-07-31T23:59:59Z";
                month = "July";
                break;}
        case "8":{start = "2016-08-01T00:00:00Z";
                stop = "2016-08-31T23:59:59Z";
                month = "August";
                break;}
        case "9":{start = "2016-09-01T00:00:00Z";
                stop = "2016-09-30T23:59:59Z";
                month = "September";
                break;}
        case "10":{start = "2016-10-01T00:00:00Z";
                stop = "2016-10-31T23:59:59Z";
                month = "October";
                break;}
        case "11":{start = "2016-11-01T00:00:00Z";
                stop = "2016-11-30T23:59:59Z";
                month = "November";
                break;}
        case "12":{start = "2016-12-01T00:00:00Z";
                stop = "2016-12-31T23:59:59Z";
                month = "December";
                break;}
        default:{start ="2016-01-01T00:00:00Z"
                stop = "2016-12-31T23:59:59"
                month = "all Year"
        }
      }


      var pCursor = Purchases.find({$and: [{group: group },{createdAt: {$gte: new Date(start)}},{createdAt: {$lte: new Date(stop)}}]})
      var total = 0
      pCursor.forEach(function(purchase) {
        total = total + purchase.price
        var user = purchase.user
        CustomUsers.update({username: user},{$inc:{balance: purchase.price}})
      })
      var temp = Groups.findOne({groupname: group})
      var n = 0
      if(!temp){ n = 1
      }else{
        temp.users.forEach(function(uId){n = n+1})
      }
      avg = total/n
      //display average of Group and Groupname
      console.log(avg + " " + group + " in " + month)
      return avg
    },
    calculateDue(g, m){
      //work with group name to ease clientside acces
      var group = Groups.findOne({groupname: g})
      if(!group){
        console.log("please enter valid groupname")
        return
      }
      var avg = Meteor.call("calculateMeanValue", g, m)
      //insert payers/receivers
      group.users.forEach(function(uId){
        var user = CustomUsers.findOne({_id: uId})
        if(user.balance < avg){
          Meteor.call("insertPayer", user, user.balance-avg)
        }else if(user.balance > avg){
          Meteor.call("insertReceiver", user, user.balance-avg)
        }
      })

      var payers = Payers.find()
      payers.forEach(function(payer){
        receivers = Receivers.find()
        var loopstop = false
        receivers.forEach(function(receiver){
          //escape code
          if(loopstop){return}
          var diff = receiver.diff + payer.diff
          if(diff > 0){
            var text = payer.username + " > " + receiver.username + "   " + (-payer.diff)
            console.log(text)
            Receivers.update({username: receiver.username},{$set: {diff: diff}})
            //did all the payments he can
            Payers.remove({username: payer.username})
            loopstop = true
          }
          else{
            //Payer can only pay the amount to even out the receiver, if Payer has to pay more, move on to next receiver with remaining difference
            var text = payer.username + " > " + receiver.username + "   " + receiver.diff
            Payers.update({username: payer.username},{$set: {diff: diff}})
            Receivers.remove({username: receiver.username})
            payer.diff = diff
            console.log(text)
          }
        })
        })
      Payers.remove({})
      Receivers.remove({})
    },

  insertPayer(payer, diff){
      Payers.insert({
        username: payer.username,
        balance: payer.balance,
        diff: diff,
        createdAt: new Date()
      })
    },
    insertReceiver(receiver, diff){
      Receivers.insert({
        username: receiver.username,
        balance: receiver.balance,
        diff: diff,
        createdAt: new Date()
      })
    },

    //helper for convenience
    resetBalance(){
      var users = CustomUsers.find()
      users.forEach(function(user) {
        CustomUsers.update({username: user.username},{$set: {"balance" :0}})
      })
    }

})
