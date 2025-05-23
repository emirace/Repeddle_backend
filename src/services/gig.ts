import axios from "axios";

// const url = "https://thirdparty.gigl-go.com";
const url = "http://test.giglogisticsse.com";

export const loginGig = async () => {
  try {
    const { data } = await axios.post(url + "/api/thirdparty/login", {
      username: "ACC001052",
      Password: "1234567",
      SessionObj: "",
    });
    console.log(data);
    return {
      token: data.Object.access_token,
      username: data.Object.UserName,
      userId: data.Object.UserId,
    };
  } catch (error) {
    throw error;
  }
};

export const fetchStations = async () => {
  try {
    const token = await loginGig();

    const {
      data,
    }: { data: { Object: { stationId: string; StateName: string }[] } } =
      await axios.get(url + "/api/thirdparty/localStations", {
        headers: { Authorization: `Bearer ${token.token}` },
      });
    return { stations: data.Object, token };
  } catch (error) {
    throw error;
  }
};
