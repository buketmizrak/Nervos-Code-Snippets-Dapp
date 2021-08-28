import React from 'react';
import { CopyBlock, dracula } from 'react-code-blocks';

interface IShowCodeSnippet {
    code: string;
}

const ShowCodeSnippet = (props: IShowCodeSnippet) => {
    return (
        <>
            {' '}
            <CopyBlock
                text={props.code}
                language="jsx"
                showLineNumbers={true}
                theme={dracula}
            />{' '}
            <br />
            <br />
            <br />
            <br />
        </>
    );
};

export default ShowCodeSnippet;
