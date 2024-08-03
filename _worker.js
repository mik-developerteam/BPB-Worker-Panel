const buildRoutingRules = (localDNS, blockAds, bypassIran, blockPorn, bypassLAN, isChain, isBalancer, isWorkerLess) => {
    let rules = [
        {
            inboundTag: ["dns-in"],
            outboundTag: "dns-out",
            type: "field"
        },
        {
          ip: [localDNS],
          outboundTag: "direct",
          port: "53",
          type: "field",
        }
    ];

    if (localDNS === 'localhost' || isWorkerLess) {
        rules.pop();
    }

    if (bypassIran || bypassLAN) {
        let rule = {
            ip: [],
            outboundTag: "direct",
            type: "field",
        };
        
        if (bypassIran && !isWorkerLess) {
            rules.push({
                domain: ["geosite:category-ir", "domain:.ir"],
                outboundTag: "direct",
                type: "field",
            });
            // اضافه کردن بای‌پس برای همه دامنه‌های جهانی
            rules.push({
                domain: ["geosite:category-geoip-cn", "geosite:category-geoip-us", "geosite:category-geoip-uk"],
                outboundTag: "proxy",
                type: "field",
            });
            rule.ip.push("geoip:ir");
        }

        bypassLAN && rule.ip.push("geoip:private");
        rules.push(rule);
    }

    if (blockAds || blockPorn) {
        let rule = {
            domain: [],
            outboundTag: "block",
            type: "field",
        };

        blockAds && rule.domain.push("geosite:category-ads-all", "geosite:category-ads-ir");
        blockPorn && rule.domain.push("geosite:category-porn");
        rules.push(rule);
    }
   
    if (isBalancer) {
        rules.push({
            balancerTag: "all",
            type: "field",
            network: "tcp,udp",
        });
    } else  {
        rules.push({
            outboundTag: isChain ? "out" : isWorkerLess ? "fragment" : "proxy",
            type: "field",
            network: "tcp,udp"
        });
    }

    return rules;
}
