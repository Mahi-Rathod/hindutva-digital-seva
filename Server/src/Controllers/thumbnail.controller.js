import { putObjectUrl } from "../utils/uploadOnS3.js";

const addPostThumbnail = async (req, res) => {
  try {
    const { fileName, fileType } = req.body;
    const { id, userName } = req.user;

    const key = `post_thumbnails/${userName}/${id}/${fileName}`;

    const s3Url = await putObjectUrl(key, fileType);

    if (!s3Url) {
      throw new Error("File can not uploaded");
    }

    return res.status(201).json({
      url: s3Url,
      key: key,
    });
  } catch (err) {
    res.status(200).json({
      success: true,
      message: err.message,
    });
  }
};


export { addPostThumbnail };
