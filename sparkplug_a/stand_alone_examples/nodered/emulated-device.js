/**
 * Copyright (c) 2016 Cirrus Link Solutions
 *
 *  All rights reserved. This program and the accompanying materials
 *  are made available under the terms of the Eclipse Public License v1.0
 *  which accompanies this distribution, and is available at
 *  http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *   Cirrus Link Solutions
 */
var deviceId = "Emulated Device"
    hwVersion = "Emulated Hardware",
    swVersion = "v1.0.0",

/*
 * Generates a random integer
 */
randomInt = function() {
    return 1 + Math.floor(Math.random() * 10);
};

getTopic = function(type) {
    return deviceId + "/" + type;
}

/*
 * Returns the full birth payload for the emulated device
 */
getBirthPayload = function() {
    return {
        "timestamp" : new Date().getTime(),
        "metric" : [
           { "name" : "my_boolean", "value" : Math.random() > 0.5, "type" : "boolean" },
           { "name" : "my_double", "value" : Math.random() * 0.123456789, "type" : "double" },
           { "name" : "my_float", "value" : Math.random() * 0.123, "type" : "float" },
           { "name" : "my_int", "value" : randomInt(), "type" : "int" },
           { "name" : "my_long", "value" : randomInt() * 214748364700, "type" : "long" },
           { "name" : "Inputs/0", "value" :  true, "type" : "boolean" },
           { "name" : "Inputs/1", "value" :  0, "type" : "int" },
           { "name" : "Inputs/2", "value" :  1.23, "type" : "float" },
           { "name" : "Outputs/0", "value" :  true, "type" : "boolean" },
           { "name" : "Outputs/1", "value" :  0, "type" : "int" },
           { "name" : "Outputs/2", "value" :  1.23, "type" : "float" },
           { "name" : "Properties/hw_version", "value" :  hwVersion, "type" : "string" },
           { "name" : "Properties/sw_version", "value" :  swVersion, "type" : "string" }
        ]
    };
};

/*
 * Returns the death payload for the emulated device
 */
getDeathPayload = function() {
    return {
        "timestamp" : new Date().getTime()
    };
};

/*
 * Returns the default position of the emulated device
 */
getPosition = function() {
    return {
        "latitude" : 38.83667239,
        "longitude" : -94.67176706,
        "altitude" : 319,
        "precision" : 2.0,
        "heading" : 0,
        "speed" : 0,
        "timestamp" : new Date().getTime(),
        "satellites" : 8,
        "status" : 3
    };
};

/*
 * Returns the data payload for the device
 */
getDataPayload = function(msg) {
    return {
        "timestamp" : msg.payload.timestamp !== undefined ? msg.payload.timestamp : new Date().getTime(),
        "position" : getPosition(),
        "metric" : [
            { "name" : "my_boolean", "value" : Math.random() > 0.5, "type" : "boolean" },
            { "name" : "my_double", "value" : Math.random() * 0.123456789, "type" : "double" },
            { "name" : "my_float", "value" : Math.random() * 0.123, "type" : "float" },
            { "name" : "my_int", "value" : randomInt(), "type" : "int" },
            { "name" : "my_long", "value" : randomInt() * 214748364700, "type" : "long" }
            ]
    };
};

/*
 * Process the incoming message by topic.  The following actions will be taked based on the incoming message topic:
 * 
 * topic = deviceId
 *   The emulated device is receiving a DCMD. Process the incoming (writable) metrics and publish all changed metrics.
 *   
 * topic = rebirth
 *   A rebirth command is requested, publish the devices full metrics.
 *   
 * topic = death
 *   Publish a device death message indicating that the device has gone offline.
 *   
 * topic = timestamp
 *   Publish the default device data payload using the new timestamp.
 */
if (msg.topic === deviceId) {
    var metric = msg.payload.metric,
        inboundMetricMap = {},
        outboundMetric = [],
        outboundPayload;

    console.log(deviceId + " received 'DCMD' command");

    // Loop over the metrics and store them in a map
    if (metric !== undefined && metric !== null) {
        for (var i = 0; i < metric.length; i++) {
            var m = metric[i];
            inboundMetricMap[m.name] = m.value;
        }
    }

    if (inboundMetricMap["Outputs/0"] !== undefined && inboundMetricMap["Outputs/0"] !== null) {
        console.log("Outputs/0: " + inboundMetricMap["Outputs/0"]);
        outboundMetric.push({ "name" : "Inputs/0", "value" : inboundMetricMap["Outputs/0"], "type" : "boolean" });
        outboundMetric.push({ "name" : "Outputs/0", "value" : inboundMetricMap["Outputs/0"], "type" : "boolean" });
        console.log("Updated value for Inputs/0 " + inboundMetricMap["Outputs/0"]);
    } else if (inboundMetricMap["Outputs/1"] !== undefined && inboundMetricMap["Outputs/1"] !== null) {
        console.log("Outputs/1: " + inboundMetricMap["Outputs/1"]);
        outboundMetric.push({ "name" : "Inputs/1", "value" : inboundMetricMap["Outputs/1"], "type" : "int" });
        outboundMetric.push({ "name" : "Outputs/1", "value" : inboundMetricMap["Outputs/1"], "type" : "int" });
        console.log("Updated value for Inputs/1 " + inboundMetricMap["Outputs/1"]);
    } else if (inboundMetricMap["Outputs/2"] !== undefined && inboundMetricMap["Outputs/2"] !== null) {
        console.log("Outputs/2: " + inboundMetricMap["Outputs/2"]);
        outboundMetric.push({ "name" : "Inputs/2", "value" : inboundMetricMap["Outputs/2"], "type" : "float" });
        outboundMetric.push({ "name" : "Outputs/2", "value" : inboundMetricMap["Outputs/2"], "type" : "float" });
        console.log("Updated value for Inputs/2 " + inboundMetricMap["Outputs/2"]);
    }

    outboundPayload = {
            "timestamp" : new Date().getTime(),
            "position" : getPosition(),
            "metric" : outboundMetric
    };

    return {
        "topic" : getTopic("DDATA"),
        "payload" : outboundPayload
    };
    
} else if (msg.topic === "rebirth") {
    console.log(deviceId + " received 'rebirth' command");
    return {
        "topic" : getTopic("DBIRTH"),
        "payload" : getBirthPayload()
    };
    
} else if (msg.topic === "timestamp"){
    console.log(deviceId + " received 'timestamp' message");
    return {
        "topic" : getTopic("DDATA"),
        "payload" : getDataPayload(msg)
    };
} else if (msg.topic === "death"){
    console.log(deviceId + " received 'timestamp' message");
    return {
        "topic" : getTopic("DDEATH"),
        "payload" : getDeathPayload(msg)
    };
}

return null;