import axios from "axios"




export default async function fetchMultipleImages(rows) {
  const imageUrls = [];

  for (const row of rows) {
    const url = `https://covers.openlibrary.org/b/${row.identifiertype}/${row.identifiernumber}-Ljpg`;
    console.log("url:",url)
    imageUrls.push(url)
    /*try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/89.0.4389.82 Safari/537.36'
        }
      });
      console.log(response.data)

      //const contentLength = parseInt(response.headers['content-length'] || "0");
      const contentLength = response.data.length
      console.log("content length",contentLength)
      if (contentLength < 2000) {
        imageUrls.push(null); // No cover found
      } else {
        const base64Image = Buffer.from(response.data, 'binary').toString('base64');
        const imageUrl = `data:image/jpeg;base64,${base64Image}`;
        imageUrls.push(imageUrl);
      }
    } catch (err) {
      console.error("Failed to fetch image for", row, err.message);
      imageUrls.push(null);
    }*/
  }
  console.log(imageUrls)
  return imageUrls;
}

