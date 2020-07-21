const functions = require("firebase-functions");

const admin = require("firebase-admin");
admin.initializeApp();

exports.deleteAuthUser = functions.https.onCall((data, context) => {
  //get user and add claims
  return admin
    .auth()
    .deleteUser(data.id)
    .then(() => {
      return {
        message: `Success! User has been deleted`
      };
    })
    .catch(err => {
      return err;
    });
});

// exports.makeAdmin = functions.https.onCall((data, context) => {
//   return admin
//     .auth()
//     .getUserByEmail(data.email)
//     .then(user => {
//       return admin.auth().setCustomUserClaims(user.uid, {
//         admin: data.admin,
//         company: data.company
//       });
//     })
//     .catch(err => {
//       return err;
//     });
// });

// exports.removeAdmin = functions.https.onCall((data, context) => {
//   return admin
//     .auth()
//     .getUserByEmail(data.email)
//     .then(user => {
//       return admin.auth().setCustomUserClaims(user.uid, {
//         admin: false
//       });
//     })
//     .catch(err => {
//       return err;
//     });
// });

// exports.makeAdminAndOwner = functions.https.onCall((data, context) => {
//   return admin
//     .auth()
//     .getUserByEmail(data.email)
//     .then(user => {
//       return admin.auth().setCustomUserClaims(user.uid, {
//         admin: true,
//         owner: true,
//         company: data.company
//       });
//     })
//     .catch(err => {
//       return err;
//     });
// });
