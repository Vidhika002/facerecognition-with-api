const video = document.getElementById('videoInput')
const head = document.getElementById('heading')
const food = document.getElementById('food')
const vid = document.getElementById('video')
const mew = document.getElementsByClassName('new')

Promise.all([
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('/models') //heavier/accurate version of tiny face detector
]).then(start)

var attendance = new Set([]);


function start() {
    //document.body.append('Models Loaded')
    
    navigator.getUserMedia(
        { video:{} },
        stream => video.srcObject = stream,
        err => console.error(err)
    )
    
    //video.src = '../videos/speech.mp4'
    console.log('video added')
    recognizeFaces()
}

async function recognizeFaces() {

    const labeledDescriptors = await loadLabeledImages()
    console.log(labeledDescriptors)
    const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.7)


    video.addEventListener('play', async () => {
        console.log('Playing')
        const canvas = faceapi.createCanvasFromMedia(video)
        document.body.append(canvas)

        const displaySize = { width: video.width, height: video.height }
        faceapi.matchDimensions(canvas, displaySize)

        

        setInterval(async () => {
            const detections = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors()

            const resizedDetections = faceapi.resizeResults(detections, displaySize)

            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)

            const results = resizedDetections.map((d) => {
                return faceMatcher.findBestMatch(d.descriptor)
            })
            results.forEach( (result, i) => {
                attendance.add(result.label.toString())
                for(let item of attendance){
                    if(item=='Vidhika'){
                       video.style.display='none';
                       canvas.style.display='none';
                    //    food.style.display='block';
                    //    document.body.style.backgroundColor = 'red';
                       vid.style.display='none';
                       window.open("https://food-delivery-app-beta.vercel.app/","_self")
                       
                    }
                }
                const box = resizedDetections[i].detection.box
                const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
                drawBox.draw(canvas)
            })
        }, 100)


        
    })
}


function loadLabeledImages() {
    const labels = ['Black Widow', 'Hawkeye' ,'Vidhika', 'Captain Marvel']
    //const labels = ['Prashant Kumar'] // for WebCam
    return Promise.all(
        labels.map(async (label)=>{
            const descriptions = []
            for(let i=1; i<=2; i++) {
                const img = await faceapi.fetchImage(`../labeled_images/${label}/${i}.jpg`)
                const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
                console.log(label + i + JSON.stringify(detections))
                descriptions.push(detections.descriptor)
            }
            //document.body.append(label+' Faces Loaded | ')
            
            return new faceapi.LabeledFaceDescriptors(label, descriptions)
        })
    )
}


