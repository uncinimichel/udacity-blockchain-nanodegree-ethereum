pragma solidity ^0.4.23;

import 'openzeppelin-solidity/contracts/token/ERC721/ERC721.sol';

contract StarNotary is ERC721 { 

    struct Star { 
        string name;
        string starStory;    
        string cent;  
        string dec;
        string mag;
    }

    mapping(bytes32 => bool) public allCoordinates;
    mapping(uint256 => Star) public tokenIdToStarInfo;
    mapping(uint256 => uint256) public starsForSale;

    function createStar(string name, string starStory, string cent, string dec, string mag, uint256 tokenId) public { 
        string memory coordinates = concatenateStarCoordinates(cent, dec, mag);
        require(bytes(tokenIdToStarInfo[tokenId].name).length == 0, "tokenId already taken");
        require(bytes(name).length != 0, "Name required");
        require(bytes(starStory).length != 0, "Star story required");
        require(bytes(cent).length != 0, "Cent required");
        require(bytes(dec).length != 0, "Dec required");
        require(bytes(mag).length != 0, "Mag required");
        require(!checkIfStarExist(coordinates), "Star already claimed");

        Star memory newStar = Star(name, starStory, cent, dec, mag);
        // Star memory newStar = Star(name, starStory);
        tokenIdToStarInfo[tokenId] = newStar;
        allCoordinates[keccak256(coordinates)] = true;

        _mint(msg.sender, tokenId);
    }

    function putStarUpForSale(uint256 tokenId, uint256 _price) public { 
        require(this.ownerOf(tokenId) == msg.sender);

        starsForSale[tokenId] = _price;
    }

    function buyStar(uint256 tokenId) public payable { 
        require(starsForSale[tokenId] > 0);
        
        uint256 starCost = starsForSale[tokenId];
        address starOwner = this.ownerOf(tokenId);
        require(msg.value >= starCost);

        _removeTokenFrom(starOwner, tokenId);
        _addTokenTo(msg.sender, tokenId);
        
        starOwner.transfer(starCost);

        if (msg.value > starCost) { 
            msg.sender.transfer(msg.value - starCost);
        }
    }
    
    function checkIfStarExist(string coordinates) private returns (bool) {
        return allCoordinates[keccak256(coordinates)];
    }

    function concatenateStarCoordinates(string cent, string dec, string mag) private pure returns (string) {
        return string(abi.encodePacked(cent, dec, mag));
    }
}