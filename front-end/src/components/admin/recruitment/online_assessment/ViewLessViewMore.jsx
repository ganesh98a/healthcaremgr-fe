import React , {useState}from 'react';

export const ViewLessViewMore = (props) => {
const [view,SetView]=useState(true);
    const viewLessText = props.question;
    const ViewMoreText = props.question.slice(0,200) + '...';
    let delimeter = props.delimeter;
    /**
     * 
     * @param {*} viewfullcontent:boolean 
     */
    const viewMoreHandler=(viewfullcontent)=> {
        SetView(viewfullcontent);
    };


  return (
    <>
    {view&&(<div style={{transition: 'all 0.5s ease-out',lineHeight:1.6, paddingBottom: '15px', borderBottom: delimeter === true? '2px solid #ccc' : '0px'}} ><span dangerouslySetInnerHTML={{__html:ViewMoreText}} ></span><span style={{color:'blue',textDecoration: 'underline',cursor:'pointer'}} onClick = {()=>viewMoreHandler(false)} >View More</span></div>)}
    {!view&&(<div  style={{transition: 'all 0.5s ease-out',lineHeight:1.6, paddingBottom: '15px', borderBottom: delimeter === true ? '2px solid #ccc' : '0px'}}><span  dangerouslySetInnerHTML={{__html:viewLessText}} ></span><span style={{color:'blue',textDecoration: 'underline',cursor:'pointer'}} onClick = {()=>viewMoreHandler(true)} >View Less</span></div>)}
       
    </>
  )
}

export const ViewLessViewMoreFormat = (props) => {
    const [showLess, setShowLess]=useState(true);
    let viewText = props.question;
    viewText = viewText.replace(/<br >/g, "<br>").replace(/<br \/>/g, "<br>").replace(/<br\/>/g, "<br>"); 

    let splitText = viewText;
    let splitView = false;    
    let strLength = viewText.length;
    let splitPos = 0;
    let splitPref = '';
    let stringBreakLength = 100;
    /**
     * Preference 
     * 1 - br tag split
     * 2 - dot
     * 3 \n new line
     * else character length - 100
     */ 
    if (viewText.indexOf('<br>') !== -1) {
        splitPos = viewText.indexOf('<br>');
        splitPref = 'br';
    } else if (viewText.indexOf('.') !== -1) {
        splitPos = viewText.indexOf('.');
        splitPref = 'dot';
    } else if (viewText.indexOf('\n') !== -1) {
        splitPos = viewText.indexOf('\n');
        splitPref = 'dot';
    }
    
    switch(splitPref) {
        case 'br':
        case 'n':
            if (splitPos !== -1 && strLength > (splitPos)) {
                splitView = true;
                splitText = showLess ? viewText.slice(0, (splitPos))+'...' : viewText;

                if (splitText.length > 100) {
                    splitText = showLess ? viewText.slice(0, stringBreakLength)+'...' : viewText;
                }
            }
            break;        
        case 'dot':
            if (splitPos !== -1 && strLength > (splitPos + 1)) {
                splitView = true;
                splitText = showLess ? viewText.slice(0, (splitPos + 1))+'...' : viewText;
                if (splitText.length > 100) {
                    splitText = showLess ? viewText.slice(0, stringBreakLength)+'...' : viewText;
                }
            }
            break;
        default:
            if (strLength > 100) {
                splitView = true;
                splitText = showLess ? viewText.slice(0, stringBreakLength)+'...' : viewText;
            }
            break;
    }    
    
    
    return (
        <div className="p-1">
            <p
                className={'p-ws'}
                
            ><span dangerouslySetInnerHTML={{__html:splitText}} />
                {splitView && (
                <a
                    style={{ color: "blue", cursor: "pointer" }}
                    onClick={() => setShowLess(!showLess)}
                >
                    &nbsp; View {showLess ? "More" : "Less"}
                </a>)}
            </p>
        </div>
    );
}
