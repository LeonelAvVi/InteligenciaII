const input = document.getElementById("uploadInput");
input.addEventListener("change",async(event) => {
   const file = event.target.files[0];
   const resizedImage = await resizeImage(file, 640, 640);
   const data = new FormData();
   data.append("image_file",resizedImage,"image_file");
   const response = await fetch("/detect",{
       method:"post",
       body:data
   });
   const boxes = await response.json();
   draw_image_and_boxes(resizedImage,boxes);
})

// alert("Hola-server");

async function resizeImage(file, maxWidth, maxHeight) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
            if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
            }
        } else {
            if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
            }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
            resolve(new File([blob], file.name));
        }, file.type);
        };
        img.onerror = reject;
    });
    }
/**
* "Upload" button onClick handler: uploads selected 
* image file to backend, receives an array of
* detected objects and draws them on top of image
*/

/**
* Function draws the image from provided file
* and bounding boxes of detected objects on
* top of the image
* @param file Uploaded file object
* @param boxes Array of bounding boxes in format
 [[x1,y1,x2,y2,object_type,probability],...]
*/
function draw_image_and_boxes(file,boxes) {
  const img = new Image()
  img.src = URL.createObjectURL(file);
  img.onload = () => {
      const canvas = document.getElementById("canvas1");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img,0,0);

      const canvasImg = document.getElementById("canvas2");
      canvasImg.width = img.width;
      canvasImg.height = img.height;
      const ctxImg = canvasImg.getContext("2d");
      ctxImg.drawImage(img,0,0);
      ctx.strokeStyle = "#00FF00";
      ctx.lineWidth = 3;
      ctx.font = "18px serif";


      list_color =[
        "#FF000070",
        "#00FF0070",
        "#0000FF70",
        "#FFFF0070",
        "#00FFFF70",
        "#FF00FF70",
        "#C0C0C070",
        "#80808070",
        "#80000070",
        "#80800070",
        "#00800070",
        "#80008070",
        "#00808070",
        "#00008070",
        "#00000070",
      ]
      let aux =0;

      boxes.forEach(([x1,y1,x2,y2,label,prob, mask]) => {
          const nametxt = label + "-" + prob;
          ctx.strokeRect(x1,y1,x2-x1,y2-y1);
          ctx.fillStyle = "#00ff00";
          const width = ctx.measureText(nametxt).width;
          ctx.fillRect(x1,y1,width+10,25);
          ctx.fillStyle = "#000000";
          ctx.fillText(nametxt,x1,y1+18);
          let colorSelect = "#fff";
          
          for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                const maskValue = mask[y][x]; // Obtén el valor de la máscara en la posición (x, y)
                const color = maskValue === 1 ? list_color[aux] : "#00000000";
                ctx.fillStyle = color;
               ctx.fillRect(x, y, 1, 1);
            }
          }
         aux = aux + 1;

      });
      console.log(boxes);
      // mask boxes.[0]
  }
}