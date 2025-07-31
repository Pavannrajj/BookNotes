// import axios from "axios"

export default async function fetchMultipleImages(rows) {
  const imageUrls = [];

  for (const row of rows) {
    const url = `https://covers.openlibrary.org/b/${row.identifiertype}/${row.identifiernumber}-Ljpg`;
    console.log("url:",url)
    imageUrls.push(url)

  }
  console.log(imageUrls)
  return imageUrls;
}

