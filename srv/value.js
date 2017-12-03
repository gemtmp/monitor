var pg = require('pg'); 

var conString = "tcp://www@localhost/monitor";

var client = new pg.Client(conString);
client.connect();

var restify = require('restify');

function send_values(res, next, qstr, params, limit) {
	if (limit)
		qstr += " limit " + limit;
	var query = client.query(qstr, params,
	  function (err, result) {
		if (err) {
			console.log("Error in " + qstr + " params " + params + ": " + err );
			return res.send(err);
		}
			
		if (result.rows.length > 0)
			return res.send(result.rows);
		return next(new restify.ResourceNotFoundError());
	});
}

function group_list(req, res, next) {
	return send_values(res, next, "select id, name from sensor_group");
}

function group(req, res, next) {
	return send_values(res, next, "select id, name from sensor_group where id=$1", [req.params.id]);
}


var valquery = " from value where value.id=sensor.id and time > now() - interval '1 day' order by time desc limit 1";
// TODO time and value may come different rows
var sensorQuery = "select sensor.id, name, unit, group_id, value.value, value.time  from sensor "
	+ "join (select id, max(time) t from value where time > now() - '1 day'::interval group by id) as maxvalue on sensor.id=maxvalue.id "
	+ "join value on sensor.id=value.id and value.time=maxvalue.t "
	+ "order by group_id, name";

function sensor_list(req, res, next) {
	return send_values(res, next, sensorQuery);
}

function sensor(req, res, next) {
	return send_values(res, next, sensorQuery + " WHERE sensor.id = $1", [req.params.id], 100);
}

function sensor_values_avg(req, res, next) {
//	switch (req.params.interval) {
//	case 'minute':
//	case 'hour':
//	case 'day':
//		break;
//	default:
//		return next(new restify.InvalidArgumentError(
//			"invalid interval, allowed 'minute', 'hour' and 'day'"));
//	}
	var start = 'now()';
	if (req.params.start != undefined) {
		// TODO sql escape and validate
		start = "timestamp '" + req.params.start + "'";
	}
	var limit = req.params.last == undefined ? 100 : 1;
	var qstr = "select id, round(cast(avg(value) as numeric),1) as value, min(t) as time,"
		+ " round(cast(EXTRACT(EPOCH FROM t) as numeric) / $1, 0) as time1"
		+ " from value as v (id, t, value) where id = $2"
		+ " and t < " + start + " and t > " + start + " - interval '"+req.params.interval * limit + " seconds'"
		+ " group by id, time1 order by time desc";
//	var qstr = "select id, round(cast(avg(value) as numeric),1) as value, date_trunc($1, t) as time "
//		+ " from value as v (id, t, value)"
//		+ " where id = $2 and t < " + start + " and t > " + start + " - interval '" + limit + " " + req.params.interval + "'" 
//		+ " group by id, time order by time desc";
		
	console.log('sensor_values: start: %s ', start);

	send_values(res, next, qstr,
		[req.params.interval, req.params.id],
		limit);
}

function sensor_values(req, res, next) {
	var qstr = "SELECT id, time, value FROM value WHERE id = $1 order by time desc";
	send_values(res, next, qstr, [req.params.id], req.params.last == undefined ? 100 : 1);
}

var server = restify.createServer();
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.jsonp());

var prefix = 'temperature';
server.get(prefix+'/group', group_list);
server.get(prefix+'/group/:id', group);
server.get(prefix+'/sensor', sensor_list);
server.get(prefix+'/sensor/:id', sensor);
server.get(prefix+'/sensor/:id/value', sensor_values);
server.get(prefix+'/sensor/:id/value/:interval', sensor_values_avg);

server.get(new RegExp('/'+prefix+'/?.*'), restify.serveStatic({'directory': '../public', 'default': 'index.html'}));

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});
