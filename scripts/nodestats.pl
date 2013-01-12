#!/usr/bin/perl

# fetch some node stats, freebsd version

use strict;

use DBI;
use Encode;
use Filesys::Df;
use Net::Ping;

sub saveValues($$) {
	my ($dbh, $arr) = @_;

	my $sth = $dbh->prepare("insert into value (id, time, value) values(?, now(), ?)");
	foreach my $id (keys %{$arr}) {
		#print ("$id ".$arr->{$id}."\n");
		$sth->execute($id, $arr->{$id});
	}
}

while() {
	sleep(60);
	my $dbh = DBI->connect_cached("dbi:Pg:dbname=monitor", "www", "", {
		AutoCommit => 1,
		RaiseError => 0 });

	my %h;
	my $t = `sysctl -n 'hw.acpi.thermal.tz0.temperature'`;
	$t =~ s/C//;
	$t =~ s/,/./;
	chomp($t);
	$h{'router CPU temp'} = $t;

	my $all = $dbh->selectall_arrayref("select id from value id where id like 'online %' group by id");
	foreach my $i (@{$all}) {
		$h{@$i[0]} = 0;
	}
	my $arp = `arp -an`;
	while($arp =~ m/(\w\w\:\w\w\:\w\w\:\w\w\:\w\w\:\w\w).+?expires/g) {
		my $id = $1;
		$id =~ s/://g;
		$h{"online $id"} = 1;
	}
	$h{"router /ext"} = df('/ext')->{'bavail'}/1024/1024;

	my $p = Net::Ping->new('icmp', 1);
	$h{"internet online"} = $p->ping('google.com') ? 1:0;
  $p->close();

	saveValues($dbh, \%h);
}

