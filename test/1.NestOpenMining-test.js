const { expect } = require('chai');
const { deploy } = require('../scripts/deploy.js');
const { toBigInt, toDecimal, showReceipt, snd, tableSnd, d1, Vc, Vp, UI } = require('./utils.js');

describe('NestOpenMining', function() {
    it('First', async function() {
        var [owner, addr1, addr2] = await ethers.getSigners();
        
        const NestOpenMining = await ethers.getContractFactory('NestOpenPlatform');
        const { 
            nest, usdt, hbtc,

            nestGovernance, nestLedger,
            nestMining, nestOpenMining,
            nestPriceFacade, nestVote,
            nTokenController, nestRedeeming
        } = await deploy();

        const getAccountInfo = async function(account) {
            let acc = account;
            account = account.address;
            return {
                eth: toDecimal(acc.ethBalance ? await acc.ethBalance() : await ethers.provider.getBalance(account)),
                usdt: toDecimal(await usdt.balanceOf(account), 6),
                hbtc: toDecimal(await hbtc.balanceOf(account), 18),
                nest: toDecimal(await nest.balanceOf(account), 18),
            };
        }
        const getStatus = async function() {
            return {
                height: await ethers.provider.getBlockNumber(),
                owner: await getAccountInfo(owner),
                addr1: await getAccountInfo(addr1),
            };
        }

        await usdt.transfer(owner.address, 10000000000000n);
        await hbtc.transfer(owner.address, 10000000000000000000000000n);
        await usdt.connect(addr1).transfer(addr1.address, 10000000000000n);
        await hbtc.connect(addr1).transfer(addr1.address, 10000000000000000000000000n);
        await nest.transfer(addr1.address, 1000000000000000000000000000n);
        console.log(await getStatus());

        await nest.approve(nestOpenMining.address, 10000000000000000000000000000n);
        await usdt.approve(nestOpenMining.address, 10000000000000000000000000n);
        await hbtc.approve(nestOpenMining.address, 10000000000000000000000000n);
        await nest.connect(addr1).approve(nestOpenMining.address, 10000000000000000000000000000n);
        await usdt.connect(addr1).approve(nestOpenMining.address, 10000000000000000000000000n);
        await hbtc.connect(addr1).approve(nestOpenMining.address, 10000000000000000000000000n);

        //await nestOpenMining.open(hbtc.address, 1000000000000000000n, usdt.address, nest.address);
        await nestOpenMining.open({
            // 计价代币地址, 0表示eth
            token0: hbtc.address,
            // 计价代币单位
            unit: 1000000000000000000n,
    
            // 报价代币地址，0表示eth
            token1: usdt.address,
            // 每个区块的标准出矿量
            rewardPerBlock: 1000000000000000000n,
    
            // 矿币地址如果和token0或者token1是一种币，可能导致挖矿资产被当成矿币挖走
            // 出矿代币地址
            reward: nest.address,
            // 矿币总量
            //uint96 vault;
    
            // 管理地址
            //address governance;
            // 创世区块
            //uint32 genesisBlock;
            // Post fee(0.0001eth，DIMI_ETHER). 1000
            postFeeUnit: 1000,
            // Single query fee (0.0001 ether, DIMI_ETHER). 100
            singleFee: 100,
            // 衰减系数，万分制。8000
            reductionRate: 8000
        });
        await nestOpenMining.increase(0, 5000000000000000000000000000n);
        console.log(await getStatus());

        if (false) {
            console.log('1. initialize');
            const nom = await NestOpenMining.deploy();
            console.log('accounts.length: ' + await nom.getAccountCount());
            await nom.initialize('0x0000000000000000000000000000000000000000');
            await nom.initialize('0x0000000000000000000000000000000000000000');
            await nom.initialize('0x0000000000000000000000000000000000000000');
            await nom.initialize(nestGovernance.address);
            console.log('accounts.length: ' + await nom.getAccountCount());
            await nom.update(nestGovernance.address);
            console.log('accounts.length: ' + await nom.getAccountCount());
        }

        if (false) {
            console.log('2. getConfig');
            let cfg = await nestOpenMining.getConfig();
            console.log(UI(cfg));

            await nestOpenMining.setConfig({
                postEthUnit: 10,
                postFeeUnit: 2000,
                minerNestReward: 3000,
                minerNTokenReward: 4500,
                doublePostThreshold: 500,
                ntokenMinedBlockLimit: 600,
                maxBiteNestedLevel: 7,
                priceEffectSpan: 80,
                pledgeNest: 900
            });

            cfg = await nestOpenMining.getConfig();
            console.log(UI(cfg));
        }
    });
});
