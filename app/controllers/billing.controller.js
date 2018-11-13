const Billing = require('../models/billing.model');
const Inventory = require('../models/inventory.master.model');
// const Items = require('../models/order-items.schema');
const { ObjectId } = require('mongodb'); // or ObjectID 
const leftPad = require('left-pad')


// Create and Save a new bill
exports.create = (req, res) => {

    var itemArray = [];


    req.body.items.forEach(function (item) {
        itemArray.push((item));
    });




    var today = new Date();
    var thisYear = today.getFullYear().toString().substr(-2)
    var todayDayTemp = today.getMonth() + 1;
    var todayDay = leftPad(todayDayTemp, 2, 0);
    console.log("todayyyyy", today);
    console.log("date", todayDay);
    console.log("year", thisYear);


    var orderCodeSliced = "BL" + thisYear + todayDay;





    // Billing.find().limit(1).sort({ $natural: -1 })
    Billing.find({ billingNumber: { $regex: orderCodeSliced, $options: "$i" } }).limit(1).sort({ $natural: -1 })
        .then(lastBill => {






            var currentOrderId = 0;
            var convertedOrderId;
            var convertedOrderIdFinal;
            var finalOrderSequence;
            var capitalizedFinalOrderSequence;

            if (lastBill.length > 0) {
                currentOrderId = lastBill[0].billingNumber + 1;

                currentOrderId = lastBill[0].billingNumber.slice(6, 9);
                convertedOrderId = parseInt(currentOrderId);
                convertedOrderIdFinal = convertedOrderId + 1;

                finalOrderSequence = "BL" + thisYear + todayDay + leftPad(convertedOrderIdFinal, 3, 0);
                capitalizedFinalOrderSequence = finalOrderSequence.toUpperCase();


            } else {
                currentOrderId = 0 + 1;

                finalOrderSequence = "BL" + thisYear + todayDay + leftPad(currentOrderId, 3, 0);
                capitalizedFinalOrderSequence = finalOrderSequence.toUpperCase();
            }





            // ############################################################################################################

            // var billNumber = 0;

            // if (lastBill.length > 0) {
            //     billNumber = lastBill[0].billingNumber + 1;
            // } else {
            //     billNumber = 0 + 1;
            // }





            // Create a bill
            const billing = new Billing({

                billingNumber: capitalizedFinalOrderSequence,
                patientName: req.body.patientName,
                patientGender: req.body.patientGender,
                patientAge: req.body.patientAge,
                billDate: req.body.billDate,
                contactNumber: req.body.contactNumber,

                items: itemArray,

                consultationFee: req.body.consultationFee,
                pharmaceuticalFee: req.body.pharmaceuticalFee,
                laboratoryFee: req.body.laboratoryFee,
                ECGFee: req.body.ECGFee,
                CBSFee: req.body.CBSFee,
                procedureFee: req.body.procedureFee,
                otherFee: req.body.otherFee,
                status: 'NEW'

            });


            // Save bill in the database
            billing.save()
                .then(data => {



                    itemArray = [];
                    // res.send(data);


                    // save billing items in inventory schema
                    var inv = [];

                    inv = req.body.items;

                    inv.forEach(element => {



                        // Create a Order
                        var inventory = new Inventory(
                            {
                                item_id: element.itemMasterId,
                                itemCode: element.itemCode,
                                itemName: element.itemName,
                                invDocType: 'BILLING',
                                invRef: capitalizedFinalOrderSequence,
                                itemExpiryDate: element.expiryDate,
                                itemQuantity: -(element.quantity),
                                // itemFreeQuantity: element.freeIssue,
                                // itemBillQuantity: element.quantity,
                                // itemTotalQuantity: element.itemTotalQuantity

                            }
                        );

                        // Save order in the database
                        inventory.save().then(data => {


                            var inventory = new Inventory({});



                            // //reduce billing quantity from inventory
                            // Inventory.update({
                            //     _id: data._id
                            // }, {
                            //         $inc: { "itemQuantity": -1 }
                            //     },


                            //     { new: true })
                            //     .then(inv => {



                            //     }).catch(err => {
                            //         if (err.kind === 'ObjectId') {
                            //             return res.status(404).send({
                            //                 message: "Order not found with id"
                            //             });
                            //         }
                            //         return res.status(500).send({
                            //             message: "Error updating order"
                            //         });
                            //     });
                            // // reduce billing quantity end







                        }).catch(err => {
                            res.status(500).send({
                                message: err.message || "Some error occurred while creating the order."
                            });
                        });

                    });


                    res.status(200).send({
                        message: "All done!!!"
                    });






                }).catch(err => {
                    res.status(500).send({
                        message: err.message || "Some error occurred while creating the bill."
                    });
                });


        }).catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving last bill."
            });
        });

};







// edit bill
exports.editBill = (req, res) => {


    var itemArray = [];


    req.body.items.forEach(function (item) {
        itemArray.push((item));
    });


    // Find bill and update it with the request body
    Billing.findByIdAndUpdate(req.params.billId, {

        patientName: req.body.patientName,
        patientGender: req.body.patientGender,
        patientAge: req.body.patientAge,
        billDate: req.body.billDate,
        contactNumber: req.body.contactNumber,

        items: itemArray,

        consultationFee: req.body.consultationFee,
        pharmaceuticalFee: req.body.pharmaceuticalFee,
        laboratoryFee: req.body.laboratoryFee,
        ECGFee: req.body.ECGFee,
        CBSFee: req.body.CBSFee,
        procedureFee: req.body.procedureFee,
        otherFee: req.body.otherFee

    }, { new: true })
        .then(bill => {
            if (!bill) {
                return res.status(404).send({
                    message: "Bill not found"
                });
            }












            // ###########################################################


            var itemArrLength = bill.items.length;
            var billItemCount = 0;

            bill.items.forEach(invEdit => {

                billItemCount = billItemCount + 1;


                console.log("Bill item>>>>>", billItemCount);

                Inventory.findOneAndUpdate({ "item_id": invEdit.itemMasterId, "invRef": bill.billingNumber }, {


                    itemCode: invEdit.itemCode,
                    itemName: invEdit.itemName,
                    invDocType: 'BILLING',
                    invRef: bill.billingNumber,
                    itemExpiryDate: invEdit.expiryDate,
                    itemQuantity: -(invEdit.quantity)


                }, { new: true })


                    // Inventory.findOneAndUpdate({ "item_id": invEdit.itemMasterId, "invRef": bill.billingNumber })
                    .then(invObj => {



                    }).catch(err => {

                        return res.status(500).send({
                            message: "Error updating supplier with id " + req.params.supplierId
                        });
                    });



                // console.log("inv items>>>>>>", JSON.stringify(invEdit.itemMasterId));
                // console.log("inv items>>>>>>", JSON.stringify(bill.billingNumber));


                if (itemArrLength == billItemCount) {
                    res.send(bill);
                    itemArray = [];
                }


            });



            // ##########################################################



            // setTimeout(function () {
            //     res.send("Done!!!!");
            //     itemArray = [];
            // }, 7000);



            // res.send(bill);
            // 


        }).catch(err => {
            if (err.kind === 'ObjectId') {
                return res.status(404).send({
                    message: "Bill not found"
                });
            }
            return res.status(500).send({
                message: "Error updating bill"
            });
        });
};
















// // Mark items as received
// exports.received = (req, res) => {


//     var inv = [];

//     inv = req.body;


//     inv.forEach(element => {





//         // Create a Order
//         var inventory = new Inventory(
//             {

//                 item_id: element.item_id,
//                 itemCode: element.itemCode,
//                 itemName: element.itemName,
//                 invDocType: element.invDocType,
//                 invRef: element.invDocType,
//                 itemExpiryDate: element.itemExpiryDate,
//                 itemQuantity: element.itemQuantity,
//                 itemFreeQuantity: element.itemFreeQuantity,
//                 itemBillQuantity: element.itemBillQuantity,
//                 itemTotalQuantity: element.itemTotalQuantity

//             }
//         );

//         // Save order in the database
//         inventory.save().then(data => {


//             var inventory = new Inventory({});


//         }).catch(err => {
//             res.status(500).send({
//                 message: err.message || "Some error occurred while creating the order."
//             });
//         });

//     });

//     res.status(200).send({
//         message: "All done!!!"
//     });

// };










// Retrieve and return all orders from the database.
exports.findAll = (req, res) => {

    var options = {
        sort: { updatedAt: -1 },
        limit: 20
    };

    Billing.paginate({ status: { $ne: 'DELETED' } }, options)
        .then(orders => {
            res.send(orders);
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving orders."
            });
        });
};

















// Update an item identified by the itemId in the request
exports.billDelete = (req, res) => {

    // Find item and update it with the request body
    Billing.findByIdAndUpdate(req.params.billNo, {


        status: 'DELETED'

    }, { new: true })
        .then(order => {
            if (!order) {
                return res.status(404).send({
                    message: "Item not found"
                });
            }
            res.send(order);
        }).catch(err => {
            if (err.kind === 'ObjectId') {
                return res.status(404).send({
                    message: "Item not found"
                });
            }
            return res.status(500).send({
                message: "Error updating"
            });
        });
};








// // change order id
// exports.orderMarkAsReceived = (req, res) => {


//     // Find item and update it with the request body
//     Order.findByIdAndUpdate(req.params.orderId, {


//         status: req.body.status

//     }, { new: true })
//         .then(order => {
//             if (!order) {
//                 return res.status(404).send({
//                     message: "Order not found"
//                 });
//             }
//             res.send(order);
//         }).catch(err => {
//             if (err.kind === 'ObjectId') {
//                 return res.status(404).send({
//                     message: "Order not found with id"
//                 });
//             }
//             return res.status(500).send({
//                 message: "Error updating order"
//             });
//         });
// };








// // edit order
// exports.editOrder = (req, res) => {

//     var itemArray = [];

//     req.body.items.forEach(function (item) {
//         itemArray.push((item));
//     });

//     // Find item and update it with the request body
//     Order.findByIdAndUpdate(req.params.orderId, {

//         // Create an Item
//         orderDate: req.body.orderDate,
//         supplierName: req.body.supplierName,
//         orderNote: req.body.orderNote,
//         items: itemArray


//     }, { new: true })
//         .then(order => {
//             if (!order) {
//                 return res.status(404).send({
//                     message: "Order not found"
//                 });
//             }
//             res.send(order);
//         }).catch(err => {
//             if (err.kind === 'ObjectId') {
//                 return res.status(404).send({
//                     message: "Order not found with id"
//                 });
//             }
//             return res.status(500).send({
//                 message: "Error updating order"
//             });
//         });
// };










// // decrement order>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

// // change order id
// exports.decrementOrder = (req, res) => {


//     // Find item and update it with the request body
//     // Order.findByIdAndUpdate(req.params.orderId, {

//     //     $inc: {'items.$.order': -1}

//     // }, 



//     Order.update({
//         _id: "5b8fdd6500d4ee04f49d78df",
//         "items._id": "5b8fdd6500d4ee04f49d78e0"
//     }, {
//             // $set: { "items.$.order": 50 }
//             // $set: { $inc: { "items.$.order": -1 } }
//             $inc: { "items.$.order": -1 }
//         },


//         { new: true })
//         .then(order => {
//             if (!order) {
//                 return res.status(404).send({
//                     message: "Order not found"
//                 });
//             }
//             res.send(order);
//         }).catch(err => {
//             if (err.kind === 'ObjectId') {
//                 return res.status(404).send({
//                     message: "Order not found with id"
//                 });
//             }
//             return res.status(500).send({
//                 message: "Error updating order"
//             });
//         });
// };






// Find a single item with a itemId
exports.getSingleBill = (req, res) => {

    Billing.findById(req.params.billNo)
        .then(bill => {
            if (!bill) {
                return res.status(404).send({
                    message: "Bill not found with id"
                });
            }
            res.send(bill);
        }).catch(err => {
            if (err.kind === 'ObjectId') {
                return res.status(404).send({
                    message: "Bill not found with id"
                });
            }
            return res.status(500).send({
                message: "Error retrieving bill"
            });
        });
};