const StarNotary = artifacts.require('StarNotary')

contract('StarNotary', accounts => { 

    beforeEach(async function() { 
        this.contract = await StarNotary.new({from: accounts[0]})
    })
    
    describe('can create a star', () => { 
        it('can create a star and get its name', async function () { 
            let tokenId = 1
            let name = 'Star power 103!'
            let starStory = 'I love my wonderful star'
            let cent = 'ra_032.155'
            let dec = 'dec_121.874'
            let mag = 'mag_245.978'
            
            await this.contract.createStar(name, starStory, cent, dec, mag, tokenId, {from: accounts[0]})
            let starStr = await this.contract.tokenIdToStarInfo(tokenId);
            assert.deepEqual(starStr, ["Star power 103!", "I love my wonderful star", "ra_032.155", "dec_121.874", "mag_245.978"])
        })

        it('can not create a start with the same coordinates of one already created', async function () { 
            let tokenId = 1
            let anotherTokenId = 2
            let name = 'Star power 103!'
            let starStory = 'I love my wonderful star'
            let cent = 'ra_032.155'
            let dec = 'dec_121.874'
            let mag = 'mag_245.978'
            
            await this.contract.createStar(name, starStory, cent, dec, mag, tokenId, {from: accounts[0]})
            await expectThrow(this.contract.createStar(name, starStory, cent, dec, mag, anotherTokenId, {from: accounts[0]}), "VM Exception while processing transaction: revert Star already claimed")
            
        })

        it('can not create a start with the same token id', async function () { 
            let tokenId = 1
            let name = 'A name'
            let starStory = 'I love my wonderful star'
            let cent = 'ra_032.155'
            let dec = 'dec_121.874'
            let mag = 'mag_245.978'
            
            await this.contract.createStar(name, starStory, cent, dec, mag, tokenId, {from: accounts[0]})
            await expectThrow(this.contract.createStar(name, starStory, cent, dec, mag, tokenId, {from: accounts[0]}), "VM Exception while processing transaction: revert tokenId already taken")          
        })

        it('can not create a start with no name', async function () { 
            let tokenId = 1
            let anotherTokenId = 2
            let name = ''
            let starStory = 'I love my wonderful star'
            let cent = 'ra_032.155'
            let dec = 'dec_121.874'
            let mag = 'mag_245.978'
            
            await expectThrow(this.contract.createStar(name, starStory, cent, dec, mag, tokenId, {from: accounts[0]}), "VM Exception while processing transaction: revert Name required")            
        })

        it('can not create a start with no story', async function () { 
            let tokenId = 1
            let anotherTokenId = 2
            let name = 'a name'
            let starStory = ''
            let cent = 'ra_032.155'
            let dec = 'dec_121.874'
            let mag = 'mag_245.978'
            
            await expectThrow(this.contract.createStar(name, starStory, cent, dec, mag, tokenId, {from: accounts[0]}), "VM Exception while processing transaction: revert Star story required")            
        })

        it('can not create a start with no cent', async function () { 
            let tokenId = 1
            let anotherTokenId = 2
            let name = 'a nam,e'
            let starStory = 'I love my wonderful star'
            let cent = ''
            let dec = 'dec_121.874'
            let mag = 'mag_245.978'
            
            await expectThrow(this.contract.createStar(name, starStory, cent, dec, mag, tokenId, {from: accounts[0]}), "VM Exception while processing transaction: revert Cent required")            
        })

        it('can not create a start with no dec', async function () { 
            let tokenId = 1
            let anotherTokenId = 2
            let name = 'a Name'
            let starStory = 'I love my wonderful star'
            let cent = 'ra_032.155'
            let dec = ''
            let mag = 'mag_245.978'
            
            await expectThrow(this.contract.createStar(name, starStory, cent, dec, mag, tokenId, {from: accounts[0]}), "VM Exception while processing transaction: revert Dec required")            
        })

        it('can not create a start with no mag', async function () { 
            let tokenId = 1
            let anotherTokenId = 2
            let name = 'a name'
            let starStory = 'I love my wonderful star'
            let cent = 'ra_032.155'
            let dec = 'dec_121.874'
            let mag = ''
            
            await expectThrow(this.contract.createStar(name, starStory, cent, dec, mag, tokenId, {from: accounts[0]}), "VM Exception while processing transaction: revert Mag required")            
        })
    })

    describe('buying and selling stars', () => { 

        let user1 = accounts[1]
        let user2 = accounts[2]

        let starId = 1
        let name = 'Star power 103!'
        let starStory = 'I love my wonderful star'
        let cent = 'ra_032.155'
        let dec = 'dec_121.874'
        let mag = 'mag_245.978'
        let starPrice = web3.toWei(.01, "ether")

        beforeEach(async function () {
            await this.contract.createStar(name, starStory, cent, dec, mag, starId, {from: user1})
        })

        describe('user1 can sell a star', () => { 
            it('user1 can put up their star for sale', async function () { 
                await this.contract.putStarUpForSale(starId, starPrice, {from: user1})
            
                assert.equal(await this.contract.starsForSale(starId), starPrice)
            })

            it('user1 gets the funds after selling a star', async function () { 
                let starPrice = web3.toWei(.05, 'ether')
                
                await this.contract.putStarUpForSale(starId, starPrice, {from: user1})

                let balanceOfUser1BeforeTransaction = web3.eth.getBalance(user1)
                await this.contract.buyStar(starId, {from: user2, value: starPrice})
                let balanceOfUser1AfterTransaction = web3.eth.getBalance(user1)

                assert.equal(balanceOfUser1BeforeTransaction.add(starPrice).toNumber(), 
                            balanceOfUser1AfterTransaction.toNumber())
            })
        })

        describe('user2 can buy a star that was put up for sale', () => { 
            beforeEach(async function () { 
                await this.contract.putStarUpForSale(starId, starPrice, {from: user1})
            })

            it('user2 is the owner of the star after they buy it', async function () { 
                await this.contract.buyStar(starId, {from: user2, value: starPrice})

                assert.equal(await this.contract.ownerOf(starId), user2)
            })

            it('user2 correctly has their balance changed', async function () { 
                let overpaidAmount = web3.toWei(.05, 'ether')

                const balanceOfUser2BeforeTransaction = web3.eth.getBalance(user2)
                await this.contract.buyStar(starId, {from: user2, value: overpaidAmount, gasPrice:0})
                const balanceAfterUser2BuysStar = web3.eth.getBalance(user2)

                assert.equal(balanceOfUser2BeforeTransaction.sub(balanceAfterUser2BuysStar), starPrice)
            })
        })
    })
})

var expectThrow = async function(promise, errorMessage) { 
    try { 
        await promise
    } catch (error) { 
        assert.exists(error)
        assert.equal(error.message, errorMessage)
        return
    }

    assert.fail('Expected an error but didnt see one!')
}