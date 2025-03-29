ip addr
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host noprefixroute 
       valid_lft forever preferred_lft forever
2: enp0s3: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether 08:00:27:79:e5:e9 brd ff:ff:ff:ff:ff:ff
    inet 192.168.0.118/24 metric 100 brd 192.168.0.255 scope global dynamic enp0s3
       valid_lft 36631sec preferred_lft 36631sec
    inet6 2c0f:f888:a980:18f6:a00:27ff:fe79:e5e9/64 scope global deprecated dynamic mngtmpaddr noprefixroute 
       valid_lft 36631sec preferred_lft 0sec
    inet6 fe80::a00:27ff:fe79:e5e9/64 scope link 
       valid_lft forever preferred_lft forever
3: docker0: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc noqueue state DOWN group default 
    link/ether de:1f:57:6b:fb:db brd ff:ff:ff:ff:ff:ff
    inet 172.17.0.1/16 brd 172.17.255.255 scope global docker0
       valid_lft forever preferred_lft forever
    inet6 fe80::dc1f:57ff:fe6b:fbdb/64 scope link 
       valid_lft forever preferred_lft forever
1116: br-45dc310f0f93: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default 
    link/ether 96:d4:12:fd:3d:c8 brd ff:ff:ff:ff:ff:ff
    inet 172.18.0.1/16 brd 172.18.255.255 scope global br-45dc310f0f93
       valid_lft forever preferred_lft forever
    inet6 fe80::94d4:12ff:fefd:3dc8/64 scope link 
       valid_lft forever preferred_lft forever
1117: vethe732952@if2: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue master br-45dc310f0f93 state UP group default

    link/ether f2:d7:e7:88:4f:5f brd ff:ff:ff:ff:ff:ff link-netnsid 0
    inet6 fe80::f0d7:e7ff:fe88:4f5f/64 scope link
       valid_lft forever preferred_lft forever
1118: vethb083154@if2: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue master br-45dc310f0f93 state UP group default

    link/ether 2a:d3:31:a0:c3:79 brd ff:ff:ff:ff:ff:ff link-netnsid 1
    inet6 fe80::28d3:31ff:fea0:c379/64 scope link
       valid_lft forever preferred_lft forever
1119: veth5c87cb2@if2: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue master br-45dc310f0f93 state UP group default

    link/ether 7e:56:8b:b2:18:44 brd ff:ff:ff:ff:ff:ff link-netnsid 2
    inet6 fe80::7c56:8bff:feb2:1844/64 scope link
       valid_lft forever preferred_lft forever
1120: vethf9a3f5a@if2: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue master br-45dc310f0f93 state UP group default

    link/ether 1e:57:7c:61:6b:f4 brd ff:ff:ff:ff:ff:ff link-netnsid 3
    inet6 fe80::1c57:7cff:fe61:6bf4/64 scope link
       valid_lft forever preferred_lft forever
1121: veth9756f8f@if2: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue master br-45dc310f0f93 state UP group default

    link/ether ee:16:e5:eb:11:30 brd ff:ff:ff:ff:ff:ff link-netnsid 4
    inet6 fe80::ec16:e5ff:feeb:1130/64 scope link
       valid_lft forever preferred_lft forever
























       ip a
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host noprefixroute 
       valid_lft forever preferred_lft forever
2: enp0s3: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether 08:00:27:79:e5:e9 brd ff:ff:ff:ff:ff:ff
    inet 192.168.0.118/24 metric 100 brd 192.168.0.255 scope global dynamic enp0s3
       valid_lft 36548sec preferred_lft 36548sec
    inet6 2c0f:f888:a980:18f6:a00:27ff:fe79:e5e9/64 scope global deprecated dynamic mngtmpaddr noprefixroute 
       valid_lft 36547sec preferred_lft 0sec
    inet6 fe80::a00:27ff:fe79:e5e9/64 scope link 
       valid_lft forever preferred_lft forever
3: docker0: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc noqueue state DOWN group default 
    link/ether de:1f:57:6b:fb:db brd ff:ff:ff:ff:ff:ff
    inet 172.17.0.1/16 brd 172.17.255.255 scope global docker0
       valid_lft forever preferred_lft forever
    inet6 fe80::dc1f:57ff:fe6b:fbdb/64 scope link
       valid_lft forever preferred_lft forever
1116: br-45dc310f0f93: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default
    link/ether 96:d4:12:fd:3d:c8 brd ff:ff:ff:ff:ff:ff
    inet 172.18.0.1/16 brd 172.18.255.255 scope global br-45dc310f0f93
       valid_lft forever preferred_lft forever
    inet6 fe80::94d4:12ff:fefd:3dc8/64 scope link
       valid_lft forever preferred_lft forever
1117: vethe732952@if2: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue master br-45dc310f0f93 state UP group default

    link/ether f2:d7:e7:88:4f:5f brd ff:ff:ff:ff:ff:ff link-netnsid 0
    inet6 fe80::f0d7:e7ff:fe88:4f5f/64 scope link
       valid_lft forever preferred_lft forever
1118: vethb083154@if2: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue master br-45dc310f0f93 state UP group default

    link/ether 2a:d3:31:a0:c3:79 brd ff:ff:ff:ff:ff:ff link-netnsid 1
    inet6 fe80::28d3:31ff:fea0:c379/64 scope link
       valid_lft forever preferred_lft forever
1119: veth5c87cb2@if2: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue master br-45dc310f0f93 state UP group default

    link/ether 7e:56:8b:b2:18:44 brd ff:ff:ff:ff:ff:ff link-netnsid 2
    inet6 fe80::7c56:8bff:feb2:1844/64 scope link
       valid_lft forever preferred_lft forever
1120: vethf9a3f5a@if2: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue master br-45dc310f0f93 state UP group default

    link/ether 1e:57:7c:61:6b:f4 brd ff:ff:ff:ff:ff:ff link-netnsid 3
    inet6 fe80::1c57:7cff:fe61:6bf4/64 scope link
       valid_lft forever preferred_lft forever
1121: veth9756f8f@if2: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue master br-45dc310f0f93 state UP group default

    link/ether ee:16:e5:eb:11:30 brd ff:ff:ff:ff:ff:ff link-netnsid 4
    inet6 fe80::ec16:e5ff:feeb:1130/64 scope link
       valid_lft forever preferred_lft forever
austin@Ubuntu-Server0:/etc/netplan$ 