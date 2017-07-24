const path  = require('path');
const { execFileSync } = require('child_process');

const isAdminBatch = path.join(__dirname, "../exe", 'isAdmin.bat');

function _hasAdminPrivileges(){
	try {
		execFileSync(isAdminBatch);
		return true;
	}
	catch(e){
		return false;
	}
}

module.exports = {
	hasAdminPrivileges : _hasAdminPrivileges
};