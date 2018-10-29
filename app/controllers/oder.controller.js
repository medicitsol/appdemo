const Order = require('../models/order.model');
const Inventory = require('../models/inventory.master.model');
const Items = require('../models/order-items.schema');
const { ObjectId } = require('mongodb'); // or ObjectID 
const leftPad = require('left-pad')


// Create and Save a new Item
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


    var orderCodeSliced = "OR" + thisYear + todayDay;


    Order.find({ orderId: { $regex: orderCodeSliced, $options: "$i" } }).limit(1).sort({ $natural: -1 })
        .then(lastOrder => {




            var currentOrderId = 0;
            var convertedOrderId;
            var convertedOrderIdFinal;
            var finalOrderSequence;
            var capitalizedFinalOrderSequence;

            if (lastOrder.length > 0) {
                currentOrderId = lastOrder[0].orderId + 1;

                currentOrderId = lastOrder[0].orderId.slice(6, 9);
                convertedOrderId = parseInt(currentOrderId);
                convertedOrderIdFinal = convertedOrderId + 1;

                finalOrderSequence = "OR" + thisYear + todayDay + leftPad(convertedOrderIdFinal, 3, 0);
                capitalizedFinalOrderSequence = finalOrderSequence.toUpperCase();


            } else {
                currentOrderId = 0 + 1;

                finalOrderSequence = "OR" + thisYear + todayDay + leftPad(currentOrderId, 3, 0);
                capitalizedFinalOrderSequence = finalOrderSequence.toUpperCase();
            }






            // Create a Order
            const order = new Order({

                orderId: capitalizedFinalOrderSequence,
                orderDate: req.body.orderDate,
                supplierName: req.body.supplierName,
                supplierId: req.body.supplierId,
                orderNote: req.body.orderNote,
                status: req.body.status,
                items: itemArray     //uncomment if needed
            });





            // Save order in the database
            order.save()
                .then(data => {
                    itemArray = [];
                    res.send(data);





                    // const items = new Items({
                    //     _id: ObjectId(data._id),
                    //     items: itemArray     //uncomment if needed

                    // });




                    // items.save()
                    //     .then(itemData => {
                    //         itemArray = [];
                    //         res.send(itemData);
                    //     }).catch(err => {
                    //         res.status(500).send({
                    //             message: err.message || "Some error occurred while creating the order items."
                    //         });
                    //     });




                }).catch(err => {
                    res.status(500).send({
                        message: err.message || "Some error occurred while creating the order."
                    });
                });




        }).catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving last order."
            });
        });

};





// Mark items as received
exports.received = (req, res) => {


    var inv = [];

    inv = req.body.items;




    // Find item and update it with the request body
    Order.findByIdAndUpdate(req.body._id, {

        status: 'RECEIVED'

    }, { new: true })
        .then(order => {





            inv.forEach(element => {



                var itemQty = 0;
                itemQty = element.order + element.freeIssue;

                // Create a Order
                var inventory = new Inventory(
                    {

                        item_id: element.itemMasterId,
                        itemCode: element.itemCode,
                        itemName: element.itemName,
                        invDocType: 'ORDER',
                        invRef: order.orderId,
                        itemExpiryDate: element.expiryDate,
                        itemQuantity: itemQty,
                        // itemFreeQuantity: element.itemFreeQuantity,
                        // itemBillQuantity: element.itemBillQuantity,
                        // itemTotalQuantity: element.itemTotalQuantity

                    }
                );

                // Save order in the database
                inventory.save().then(data => {


                    var inventory = new Inventory({});


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

            return res.status(500).send({
                message: "Error updating supplier with id " + req.params.supplierId
            });
        });


};










// Retrieve and return all orders from the database.
exports.findAll = (req, res) => {


    var options = {
        sort: { updatedAt: -1 },
        limit: 20
    };

    Order.paginate({ status: { $ne: 'DELETED' } }, options)
        .then(orders => {
            res.send(orders);
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving orders."
            });
        });
};











// change order id
exports.orderMarkAsReceived = (req, res) => {


    // Find item and update it with the request body
    Order.findByIdAndUpdate(req.params.orderId, {


        status: req.body.status

    }, { new: true })
        .then(order => {
            if (!order) {
                return res.status(404).send({
                    message: "Order not found"
                });
            }
            res.send(order);
        }).catch(err => {
            if (err.kind === 'ObjectId') {
                return res.status(404).send({
                    message: "Order not found with id"
                });
            }
            return res.status(500).send({
                message: "Error updating order"
            });
        });
};








// edit order
exports.editOrder = (req, res) => {

    var itemArray = [];

    req.body.items.forEach(function (item) {
        itemArray.push((item));
    });

    // Find item and update it with the request body
    Order.findByIdAndUpdate(req.params.orderId, {

        // Create an Item
        orderDate: req.body.orderDate,
        supplierName: req.body.supplierName,
        supplierId: req.body.supplierId,
        orderNote: req.body.orderNote,
        items: itemArray


    }, { new: true })
        .then(order => {
            if (!order) {
                return res.status(404).send({
                    message: "Order not found"
                });
            }
            res.send(order);
        }).catch(err => {
            if (err.kind === 'ObjectId') {
                return res.status(404).send({
                    message: "Order not found with id"
                });
            }
            return res.status(500).send({
                message: "Error updating order"
            });
        });
};










// decrement order>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

// change order id
exports.decrementOrder = (req, res) => {


    // Find item and update it with the request body
    // Order.findByIdAndUpdate(req.params.orderId, {

    //     $inc: {'items.$.order': -1}

    // }, 



    Order.update({
        _id: "5b8fdd6500d4ee04f49d78df",
        "items._id": "5b8fdd6500d4ee04f49d78e0"
    }, {
            // $set: { "items.$.order": 50 }
            // $set: { $inc: { "items.$.order": -1 } }
            $inc: { "items.$.order": -1 }
        },


        { new: true })
        .then(order => {
            if (!order) {
                return res.status(404).send({
                    message: "Order not found"
                });
            }
            res.send(order);
        }).catch(err => {
            if (err.kind === 'ObjectId') {
                return res.status(404).send({
                    message: "Order not found with id"
                });
            }
            return res.status(500).send({
                message: "Error updating order"
            });
        });

};










// Update an item identified by the itemId in the request
exports.orderDelete = (req, res) => {

    // Find item and update it with the request body
    Order.findByIdAndUpdate(req.params.orderId, {


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