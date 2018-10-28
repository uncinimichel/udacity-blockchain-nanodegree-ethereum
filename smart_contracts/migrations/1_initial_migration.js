var Migrations = artifacts.require("./Migrations.sol");
var StarNotary = artifacts.require("./StarNotary.sol");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
  deployer.deploy(StarNotary);
};
