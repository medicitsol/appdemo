const Inventory = require('../models/inventory.master.model');
const Item = require('../models/item-master.model.js');
const { ObjectId } = require('mongodb'); // or ObjectID 






// Retrieve and return all items from the database.
exports.getBalanceQuantity = (req, res) => {
    Inventory.aggregate(


        [{
            $match: { "item_id": req.params.itemId },
        }, {
            $group: {
                _id: null,
                itemQuantity: {
                    $sum: "$itemQuantity"
                }
            }
        }])

        .then(items => {
            res.send(items);
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving items."
            });
        });

};






exports.getPurchaseQuantity = (req, res) => {



    var today = new Date();
    var todayDate = today.toISOString();

    var reportType = req.body.reportType
    var dateFilter = {};


    if (reportType == 1) {

        dateFilter = { item_id: req.params.itemId, invDocType: 'ORDER' }

    } else if (reportType == 2) {


        var lastWeek = new Date();
        var lastWeekDate;
        lastWeek.setDate(lastWeek.getDate() - 7);
        lastWeek.setUTCHours(0, 0, 0, 0);
        lastWeekDate = lastWeek.toISOString();

        dateFilter = { billDate: { $gte: lastWeekDate, $lt: todayDate }, item_id: req.params.itemId, invDocType: 'ORDER' }

    } else if (reportType == 3) {
        var date = new Date();
        var monthToDate;
        var monthFirst = new Date(date.getFullYear(), date.getMonth(), 2);
        monthFirst.setUTCHours(0, 0, 0, 0);
        monthToDate = monthFirst.toISOString();

        dateFilter = { billDate: { $gte: monthToDate, $lt: todayDate }, item_id: req.params.itemId, invDocType: 'ORDER' }


    } else if (reportType == 4) {

        var yearToDate;
        var yearFirst = new Date(new Date().getFullYear(), 0, 2);
        yearFirst.setUTCHours(0, 0, 0, 0);
        yearToDate = yearFirst.toISOString();

        dateFilter = { billDate: { $gte: yearToDate, $lt: todayDate }, item_id: req.params.itemId, invDocType: 'ORDER' }
    }




    Inventory.aggregate(


        [{
            $match: dateFilter,
        }, {
            $group: {
                _id: null,
                itemPurchase: {
                    $sum: "$itemQuantity"
                }
            }
        }])

        .then(items => {
            res.send(items);
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving items."
            });
        });

};






exports.getIssueQuantity = (req, res) => {


    var today = new Date();
    var todayDate = today.toISOString();

    var reportType = req.body.reportType
    var dateFilter = {};


    if (reportType == 1) {

        dateFilter = { item_id: req.params.itemId, invDocType: 'BILLING' }

    } else if (reportType == 2) {


        var lastWeek = new Date();
        var lastWeekDate;
        lastWeek.setDate(lastWeek.getDate() - 7);
        lastWeek.setUTCHours(0, 0, 0, 0);
        lastWeekDate = lastWeek.toISOString();

        dateFilter = { billDate: { $gte: lastWeekDate, $lt: todayDate }, item_id: req.params.itemId, invDocType: 'BILLING' }

    } else if (reportType == 3) {
        var date = new Date();
        var monthToDate;
        var monthFirst = new Date(date.getFullYear(), date.getMonth(), 2);
        monthFirst.setUTCHours(0, 0, 0, 0);
        monthToDate = monthFirst.toISOString();

        dateFilter = { billDate: { $gte: monthToDate, $lt: todayDate }, item_id: req.params.itemId, invDocType: 'BILLING' }


    } else if (reportType == 4) {

        var yearToDate;
        var yearFirst = new Date(new Date().getFullYear(), 0, 2);
        yearFirst.setUTCHours(0, 0, 0, 0);
        yearToDate = yearFirst.toISOString();

        dateFilter = { billDate: { $gte: yearToDate, $lt: todayDate }, item_id: req.params.itemId, invDocType: 'BILLING' }
    }


    Inventory.aggregate(


        [{
            $match: dateFilter,
        }, {
            $group: {
                _id: null,
                itemIssue: {
                    $sum: "$itemQuantity"
                }
            }
        }])

        .then(items => {
            res.send(items);
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving items."
            });
        });

};




// Retrieve and return all items from the database.
exports.itemMovement = (req, res) => {
    Inventory.find({ itemCode: req.params.itemCode })
        .then(items => {
            res.send(items);
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving items."
            });
        });
};









// Retrieve and return all items from the database.
exports.getAllExpiryDates = (req, res) => {
    Inventory.find({ invDocType: { $ne: 'BILLING' }, itemCode: req.params.itemCode, itemExpiryDate: { $ne: null } })
        .then(inventoryExpiryDates => {
            res.send(inventoryExpiryDates);
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving items."
            });
        });

};









// Retrieve and return all items from the database.
exports.getItemQuantityByExpirydate = (req, res) => {
    Inventory.aggregate(


        [{
            $match: { "itemCode": req.body.itemId, "itemExpiryDate": req.body.itemExpiryDate },
        }, {
            $group: {
                _id: null,
                itemQuantity: {
                    $sum: "$itemQuantity"
                }
            }
        }])

        .then(qtyBalance => {
            res.send(qtyBalance);
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving items."
            });
        });

};














// Retrieve and return all items from the database.
exports.getAllInventoryItems = (req, res) => {

    var options = {
        sort: { updatedAt: -1 },
        limit: 20
    };

    var finItem = [];
    var exDates = [];


    Item.paginate({ status: { $ne: 'DELETED' } }, options)
        .then(allItems => {

            var allItemsArray = allItems.docs;





            allItemsArray.forEach(itemElement => {

                Inventory.aggregate(

                    [{
                        $match: { "item_id": ObjectId(itemElement._id).toString() },
                    }, {
                        $group: {
                            _id: itemElement._id,
                            itemQuantity: {
                                $sum: "$itemQuantity"
                            }
                        }
                    }])

                    .then(items => {

                        finItem.push({
                            balance: items[0].itemQuantity,
                            itemId: items[0]._id,
                            itemObj: itemElement
                        })

                    }).catch(err => {
                        res.status(500).send({
                            message: err.message || "Some error occurred while retrieving items."
                        });
                    });
            });




























            setTimeout(function () {
                res.send(finItem);

            }, 500);








            // setTimeout(function () {
            //     res.send(exDates);

            // }, 100);










            // setTimeout(function () {



            //     finItem.forEach(element => {

            //         Inventory.find({ item_id: element.itemId })
            //             .then(inventoryExpiryDates => {


            //                 // exDates.push(inventoryExpiryDates);
            //                 // exDates = inventoryExpiryDates;

            //                 // console.log(JSON.stringify(inventoryExpiryDates))

            //                 inventoryExpiryDates.forEach(iiiTeee => {
            //                     exDates.push(iiiTeee);
            //                 });


            //             }).catch(err => {
            //                 res.status(500).send({
            //                     message: err.message || "Some error occurred while retrieving items."
            //                 });
            //             });
            //     });




            // }, 100);



            // setTimeout(function () {
            //     res.send(exDates);

            // }, 500);



        }).catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving items."
            });
        });

};