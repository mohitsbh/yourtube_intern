// import Video from "./Models/video.js";
import Video from "./Models/Video";

const test = async () => {
  const video = await Video.findById("68766645d80329b1b25e4378");
  console.log(video);
};
test();
