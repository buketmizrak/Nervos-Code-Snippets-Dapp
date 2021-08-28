pragma solidity >=0.8.0;

contract CodeSnippets {
    
    uint public totalCodes;
    
    mapping(uint => Code) public codes;
    
    constructor() {
      totalCodes = 0;
    }

    event CodeCreated(uint id,string text);

    struct Code{
      uint id;
      string text;
    }

    function createCodeSnippet(string memory _text) public {
      require(bytes(_text).length > 0 ,"Code is empty!");
      
      totalCodes++;
      codes[totalCodes] = Code(totalCodes,_text);
      emit CodeCreated(totalCodes, _text);
    }

}