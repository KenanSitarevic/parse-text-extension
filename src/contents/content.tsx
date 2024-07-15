import { useMessage } from "@plasmohq/messaging/hook"

function scrapeText() {
    // Deletes css i scripts from the text
  
    const elementsToRemove = document.querySelectorAll('script, style, noscript');
    elementsToRemove.forEach(element => element.remove());
  
    // Takes the text from the body
    const bodyText = document.body.innerText;
    
    
    return bodyText;
  }

const scrapePage = () =>{
    useMessage(async (req, res) => {
        const {name} = req
        if (name === "scrape") {
          const scrapedText = scrapeText();
          res.send({ text: scrapedText });
        }
      });
  }


export default scrapePage;