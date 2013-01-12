var pg = require('pg'); 

var conString = "tcp://www:1q2w3eQAWSED@router/monitor";

var client = new pg.Client(conString);
client.connect();

var restify = require('restify');

function send_values(res, next, qstr, params, limit) {
	if (limit)
		qstr += " limit " + limit;
	var query = client.query(qstr, params,
	  function (err, result) {
		if (err)
			return res.send(err);
		if (result.rows.length > 0)
			return res.send(result.rows);
		return next(new restify.ResourceNotFoundError());
	});
}


// TODO time and value may come different rows
var sensorQuery = "SELECT id, name, unit"
	+ ",(select value from value where value.id=sensor.id order by time desc limit 1) as value"
	+ ",(select time from value where value.id=sensor.id order by time desc limit 1) as time"
	+ " FROM sensor";

function sensor_list(req, res, next) {
	return send_values(res, next, sensorQuery);
}

function sensor(req, res, next) {
	return send_values(res, next, sensorQuery + " WHERE sensor.id = $1", [req.params.id]);
}

function sensor_values_avg(req, res, next) {
	switch (req.params.interval) {
	case 'minute':
	case 'hour':
	case 'day':
		break;
	default:
		return next(new restify.InvalidArgumentError(
			"invalid interval, allowed 'minute', 'hour' and 'day'"));
	}
	var qstr = "select id, round(cast(avg(value) as numeric),1) as value, date_trunc($1, t) as time "
		+ " from value as v (id, t, value) where id = $2 group by id, time order by time desc";
		
	send_values(res, next, qstr, [req.params.interval, req.params.id], req.params.last == undefined ? 100 : 1);	
}

function sensor_values(req, res, next) {
	var qstr = "SELECT id, time, value FROM value WHERE id = $1 order by time desc";
	send_values(res, next, qstr, [req.params.id], req.params.last == undefined ? 100 : 1);
}

var server = restify.createServer();
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.jsonp());

server.get('/sensor', sensor_list);
server.get('/sensor/:id', sensor);
server.get('/sensor/:id/value', sensor_values);
server.get('/sensor/:id/value/:interval', sensor_values_avg);

server.get(/^\/$/, function(req, res, next){
	res.writeHead(302, {'Location': '/index.html'});
	res.end();
});
server.get(/\/.*\.html/, restify.serveStatic({directory: '../public/'}));
server.get(/\/.*\.css/, restify.serveStatic({directory: '../public/'}));
server.get(/\/.*\.js/, restify.serveStatic({directory: '../public/'}));

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});