# dev_starter
to insert a User (class customUsers) in the DB, fill the username in the form and leave tag empty.

Choose the group, you want to share the payment with, at input. If the Group doesn't exist yet, a new one gets created and the Users is it's only member. 
If the group already exist, the User will be added to the group, if he's not already in

To calculate due, enter the groupname and the month (default is whole year) in the 2nd form. Results get printed on server console

After each calculation of due, you can check the db.customUsers.find() in the mongo shell. Each user has the balance of the last calculation to verify results if necessary
