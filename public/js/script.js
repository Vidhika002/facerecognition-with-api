const video = document.getElementById('videoInput')
const userform = document.getElementById('userform')
const login = document.getElementById('login')
const vid = document.getElementById('video')
const play = document.getElementById('play')

Promise.all([
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('/models') //heavier/accurate version of tiny face detector
])//.then(start)

var identifier = new Set([]);

// document.getElementById("play").onclick = function() {playvideo()};
// function start() {
    //document.body.append('Models Loaded')

    document.getElementById('play').addEventListener('click', ()=>{
        navigator.getUserMedia(
            { video: {} },
            stream => video.srcObject = stream,
            err => console.error(err)
            
        )
        recognizeFaces()
    })
        

    //video.src = '../videos/speech.mp4'
    // console.log('video added')
    
// }

async function recognizeFaces() {

    const labeledDescriptors = await loadLabeledImages()
    // console.log(labeledDescriptors)
    const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.7)


    // video.addEventListener('play', async () => {
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
            results.forEach((result, i) => {
                identifier.add(result.label.toString())
                // formed a new set, take input of result.label
                console.log(identifier);
                const box = resizedDetections[i].detection.box
                const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
                drawBox.draw(canvas)
            })
            // identifier = Array.from(identifier);
            // let size = identifier.length;
            // for (let i = 0; i < size; i++) {
            //     if (identifier[i] == sarthak) {
            //         video.style.display = 'none';
            //         canvas.style.display = 'none';
            //         vid.style.display = 'none';
            //         window.open("https://food-delivery-app-beta.vercel.app/", "_self")
            //     }
            // }
            const [first] = identifier;
            const [, second] = identifier;
            if (first == "Vidhika" || second == "Vidhika") {
                // document.getElementById('sarth').innerHTML= 'detected';
                video.style.display = 'none';
                canvas.style.display = 'none';
                login.style.display='block';
                play.style.display='none';
                userform.style.display='none';


            }
            if (first == "unknown") {
                document.getElementById('unknown').innerHTML= 'not detected';
            }
            
        }, 2000)



    // })
}
document.getElementById("login").onclick = function() {myFunction()};

function myFunction() {
    window.open("https://food-delivery-app-beta.vercel.app/", "_self")
}

function loadLabeledImages() {
    const labels = ['Vidhika']
    //const labels = ['Prashant Kumar'] // for WebCam
    return Promise.all(
        labels.map(async (label) => {
            const descriptions = []
            for (let i = 1; i <= 3; i++) {
                const img = await faceapi.fetchImage(`../labeled_images/${label}/${i}.jpg`)
                const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
                // console.log(label + i + JSON.stringify(detections))
                descriptions.push(detections.descriptor)
            }
            //document.body.append(label+' Faces Loaded | ')

            return new faceapi.LabeledFaceDescriptors(label, descriptions)
        })
    )
}