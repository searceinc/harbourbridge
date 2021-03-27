// Components 
import '../../components/Tab/Tab.component.js';
import "../../components/Tab/Tabb.component.js";
import "../../components/Label/Label.component.js";
import "../../components/ImageIcon/ImageIcon.component.js";
import "../../components/Modal/Modal.component.js";
import "../../components/HistoryTable/HistoryTable.component.js";

// Services
import Store from "./../../services/Store.service.js";

const HEADING_TEXT = "Welcome To HarborBridge";
const SUB_HEADING_TEXT = "Connect or import your database";


const MAIN_PAGE_ICONS = [{
        image: "Icons/Icons/Group 2048.svg",
        imageAltText: "connect to db",
        label: "Connect to Database",
        action: "openConnectionModal",
        modalDataTarget: "#connectToDbModal",
        
    },
    {
        image: "Icons/Icons/Group 2049.svg",
        imageAltText: "load database image",
        label: "Load Database Dump",
        action: "openDumpLoadingModal",
        modalDataTarget: "#loadDatabaseDumpModal",
    },
    {
        image: "Icons/Icons/importIcon2.jpg",
        imageAltText: "Import schema image",
        label: "Load Session File",
        action: "openSessionFileLoadModal",
        modalDataTarget: "#loadSchemaModal",
    },
]

const CONNECTION_SUCCESS_CONTENT = "Please click on convert button to proceed with schema conversion";

class MainScreen extends HTMLElement {

    connectedCallback() {
        this.stateObserver = setInterval(this.observeState, 200);
        this.render();
    }

    disconnectedCallback() {
        clearInterval(this.stateObserver);
    }

    observeState = () => {
        if (JSON.stringify(Store.getinstance()) !== JSON.stringify(this.data)) {
            this.data = Store.getinstance();
            this.render();
        }
    }

    render() {
            if (!this.data) { return; }
            let { open, funcc, something, currentModal } = this.data;
            console.log(open, funcc, something, ' are the values ');
            this.innerHTML = `
            <div>
            <div id="snackbar"></div>
            <div class="page-heading">
                <hb-label type="heading" text="${HEADING_TEXT}"></hb-label>
                <hb-label type="subHeading" text="${SUB_HEADING_TEXT}"></hb-label>
            </div>
            <div class="card-area">
                <div class="icons-card-section">
                    ${MAIN_PAGE_ICONS.map((icon) => {
                        return `<div class="icon-card">
                            <hb-image-icon image="${icon.image}" imageAltText="${icon.imageAltText}" label="${icon.label}" clickAction="${icon.action}" modalDataTarget="${icon.modalDataTarget}" >
                            </hb-image-icon>
                        </div>`;
                    }).join("")}
                </div>
            </div>
            <hb-modal modalId="connectToDbModal" content="<hb-connect-to-db-form></hb-connect-to-db-form>" title="Connect to Database"></hb-modal>
            <hb-modal modalId="loadDatabaseDumpModal" content="<hb-load-db-dump-form></hb-load-db-dump-form>" title="Load Database Dump"></hb-modal>
            <hb-modal modalId="loadSchemaModal" content="<hb-load-session-file-form></hb-load-session-file-form>" title="Load Session File"></hb-modal>
            <hb-modal modalId="connectModalSuccess" content="${CONNECTION_SUCCESS_CONTENT}" title="Connection Successful"></hb-modal>
            <hb-tab open="${open}" relay=${funcc} ></hb-tab>
            <hb-tabb something="${something}" open="${open}" clickAction="openModal1" ></hb-tabb>
            <div class="history-content">
            <hb-history-table></hb-history-table>
            </div>
            </div>       
        `;
    }

    constructor() {
        super();
    }
}

window.customElements.define('hb-main-screen', MainScreen);