import { ref, watchEffect } from 'vue'
import { projectFirestore } from '../../firebase/config'

const getSubCollection = (postId, target) => {

    const subCollection = ref([])
    const error = ref('')

    // register the firestore collection reference
    let collectionRef = projectFirestore.collection(`verifiedPost/${postId}/` + target)
        .orderBy('createdAt', 'desc')

    const unsub = collectionRef.onSnapshot(snap => {
        let results = []
        snap.docs.forEach(doc => {
            // must wait for the server to create the timestamp & send it back
            // we don't want to edit data until it has done this
            doc.data().createdAt && results.push({...doc.data(), id: doc.id })
        });

        // update values
        subCollection.value = results
        error.value = null
    }, err => {
        console.log(err.message)
        subCollection.value = null
        error.value = 'could not fetch the data'
    })

    watchEffect((onInvalidate) => {
        // unsub from prev collection when watcher is stopped (component unmounted)
        onInvalidate(() => unsub());
    });

    return { error, subCollection }
}

export default getSubCollection