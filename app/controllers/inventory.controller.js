const Inventory = require('../models/inventory.master.model');
const Item = require('../models/item-master.model.js');
const { ObjectId } = require('mongodb'); // or ObjectID 
const DateDiff = require('date-diff');






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
        limit: 500
    };

    var finItem = [];

    var isxxx = 0


    Item.paginate({ status: { $ne: 'DELETED' } }, options)
        .then(allItems => {


            finItem = allItems.docs;
            var itemArr = [];


            var arrayIndex = 0;
            var itemArrayLength = finItem.length;

            // console.log("first array>>>>", itemArrayLength);


            // finItem.forEach(itemElem => {

            //     callFunc(itemElem, arrayIndex = arrayIndex + 1);

            // });


            // finItem.forEach(function (value, i) {
            //     callFunc(value, i + 1);
            // });


            // async function processArray(cars) {
            //     for (const car of cars) {
            //         await delayedLog(car);
            //     }
            //     console.log("done");
            // }

            // async function delay() {
            //     return new Promise(resolve => setTimeout(resolve, 1000))
            // }

            async function delayedLog(item, id) {
                // setTimeout(() => {
                // delay();

                console.log(item);
                console.log("Id>>>>>>", id);
                // }, 2000);
            }



            processArray(finItem);



            async function processArray(items) {
                let myIndex = 0;
                for (const item of items) {
                    await callFunc(item, myIndex = myIndex + 1);
                }
                // var count;

                // for(count = 0; count < items.length; count++){
                //     await callFunc(item[count], count);
                // }


                console.log("done");

                // const promises = items.map(callFunc);

                // await Promise.all(promises)

                // console.log("done");
            }


            // processArray([1, 2, 3]);

            async function callFunc(item, id) {

                // console.log("id>>>>>>>", id);



                Inventory.aggregate(
                    [{
                        $match: { item_id: ObjectId(item._id).toString() },
                    }, {
                        $group: {
                            _id: null,
                            itemIssue: {
                                $sum: "$itemQuantity"
                            }
                        }
                    }])

                    .then(items => {


                        isxxx = isxxx + 1;
                        console.log("looop iddd>>>>", isxxx);

                        var issueBalance = 0;
                        if (items.length == 0) {
                            issueBalance = 0;
                        } else {
                            issueBalance = items[0]["itemIssue"]
                        }

                        var itemsA = {
                            _id: item._id,
                            itemCode: item.itemCode,
                            itemName: item.itemName,
                            reorderLevel: item.reorderLevel,
                            orderQuantity: item.orderQuantity,
                            unit: item.unit,
                            price: item.price,
                            shortExpiry: item.shortExpiry,
                            status: item.status,
                            balance: issueBalance,
                            createdAt: item.createdAt,
                            updatedAt: item.updatedAt,
                            __v: item.__v
                        }

                        itemArr.push(itemsA);
                        // **********************************
                        if (itemArrayLength == isxxx) {
                            getExpiryDaes(itemArr);
                        }

                        function getExpiryDaes(item) {

                            var itemExArr = [];
                            var itemExArrLength = item.length;
                            var itemExArrIndex = 0;

                            item.forEach(element => {


                                Inventory.find({ invDocType: { $ne: 'BILLING' }, item_id: element._id, itemExpiryDate: { $ne: null } })
                                    .then(inventoryExpiryDates => {

                                        itemExArrIndex = itemExArrIndex + 1;

                                        var itemSelectedDates = [];
                                        var maxDate;

                                        inventoryExpiryDates.forEach(dates => {
                                            itemSelectedDates.push(dates.itemExpiryDate)
                                        });

                                        function max_date(all_dates) {
                                            var max_dt = all_dates[0],
                                                max_dtObj = new Date(all_dates[0]);
                                            all_dates.forEach(function (dt, index) {
                                                if (new Date(dt) > max_dtObj) {
                                                    max_dt = dt;
                                                    max_dtObj = new Date(dt);
                                                }
                                            });
                                            return max_dt;
                                        }


                                        if (max_date(itemSelectedDates) == undefined) {
                                            maxDate = "0"
                                        } else {
                                            maxDate = max_date(itemSelectedDates);
                                        }



                                        var todayDate = new Date();

                                        var expiryStatus = "0";

                                        if (maxDate != "0") {

                                            var thisYear = parseInt(todayDate.getFullYear());
                                            var thisMonth = parseInt(todayDate.getMonth() + 1);
                                            var thisDate = parseInt(todayDate.getDate());

                                            var shortExpiryDate = new Date();
                                            shortExpiryDate.setDate(shortExpiryDate.getDate() - element.shortExpiry);

                                            var shortYear = parseInt(shortExpiryDate.getFullYear());
                                            var shortMonth = parseInt(shortExpiryDate.getMonth() + 1);
                                            var shortDate = parseInt(shortExpiryDate.getDate());

                                            var expiryYear = parseInt(maxDate.slice(0, 4));
                                            var expiryMonth = parseInt(maxDate.slice(5, 7));
                                            var expiryDate = parseInt(maxDate.slice(8, 10));



                                            var today = new Date(thisYear, thisMonth, thisDate);
                                            var expiry = new Date(expiryYear, expiryMonth, expiryDate);
                                            var shortExDate = new Date(shortYear, shortMonth, shortDate);



                                            var diff = new DateDiff(expiry, today);

                                            var shortDiff = new DateDiff(expiry, shortExDate);

                                            if (diff.days() <= 0) {
                                                expiryStatus = "EXPIRED"
                                            } else {
                                                console.log("SHORT>>>>>>>>", shortDiff.days());
                                                if (shortDiff.days() >= 0) {
                                                    expiryStatus = "SHORT EXPIRY"
                                                } else {
                                                    expiryStatus = "0"
                                                }
                                            }
                                        }


                                        var itemWithExDates = {
                                            _id: element._id,
                                            itemCode: element.itemCode,
                                            itemName: element.itemName,
                                            reorderLevel: element.reorderLevel,
                                            orderQuantity: element.orderQuantity,
                                            unit: element.unit,
                                            price: element.price,
                                            shortExpiry: element.shortExpiry,
                                            status: element.status,
                                            balance: element.balance,
                                            createdAt: element.createdAt,
                                            updatedAt: element.updatedAt,
                                            expiryDate: maxDate,
                                            expiryStatus: expiryStatus,
                                            __v: element.__v
                                        }




                                        if (req.params.inventoryFilter == 1) {
                                            // all

                                            itemExArr.push(itemWithExDates);

                                        } else if (req.params.inventoryFilter == 2) {
                                            // instock

                                            if (itemWithExDates.balance > itemWithExDates.reorderLevel) {
                                                itemExArr.push(itemWithExDates);
                                            }

                                        } else if (req.params.inventoryFilter == 3) {
                                            // outofstock

                                            if (itemWithExDates.balance <= itemWithExDates.reorderLevel) {
                                                itemExArr.push(itemWithExDates);
                                            }

                                        } else if (req.params.inventoryFilter == 4) {
                                            // short expire

                                            if (itemWithExDates.expiryStatus == "SHORT EXPIRY") {
                                                itemExArr.push(itemWithExDates);
                                            }

                                        } else if (req.params.inventoryFilter == 5) {
                                            //expired

                                            if (itemWithExDates.expiryStatus == "EXPIRED") {
                                                itemExArr.push(itemWithExDates);
                                            }

                                        }








                                        if (itemExArrLength == itemExArrIndex) {
                                            res.send(itemExArr);
                                        }

                                    }).catch(err => {
                                        res.status(500).send({
                                            message: err.message || "Some error occurred while retrieving items."
                                        });
                                    });
                            });
                        }

                    }).catch(err => {
                        res.status(500).send({
                            message: err.message || "Some error occurred while retrieving items."
                        });
                    });
            }

        }).catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving items."
            });
        });

};