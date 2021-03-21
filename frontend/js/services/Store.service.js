// import the fetch service here
import Fetch from "./Fetch.service.js";

const Store = (function() {

    var instance;

    function init() {
        console.log('In the Store service ', Fetch.getData());
        // the initial data from the fetch service
        return {
            ...Fetch.getData()
        }
    }

    return {
        getinstance: function() {
            if(!instance) {
                instance = init();
            }
            return instance;
        },
        // Other store maniuolator functions here 
        // may be later can be moved to actions and stiched to affect the store
        addAttrToStore: () => {
            instance = {...instance, something: 'of value'}
        },
        toggleStore: () => {
            let openVal = instance.open;
            if(instance.open === 'no') {
                openVal = 'yes';
            } else {
                openVal = 'no';
            }
            instance = {...instance, open: openVal};
        }
    };
})();

export default Store;