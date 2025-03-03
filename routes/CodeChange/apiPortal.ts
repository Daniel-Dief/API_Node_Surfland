import axios from "axios";
import { CodeProduct } from "../../types/CodeChange";
import { resumeProduct } from "../../types/productResume";


async function getToken() {
  const url = "https://apis.surflandbrasil.com.br/api/login/signIn";
  const data = "------WebKitFormBoundaryNmv7Az9ObTbJmL0F--";
  const headers = {
    Authorization: "Basic Mjc4Ljc5OC40MzMtOTY6NjgyNzA5"
  };
  
  try {
    const response = await axios.post(url, data, { headers });

    return ('Bearer ' + response.headers['x-access-token']);
  } catch (error) {
    console.error("Erro na requisição:", error);
  }
};

async function fetchProductAvailability(date : string){
  const url = "https://apis.surflandbrasil.com.br/api/Report/ProductsAvailability";
  const params = {
    startDate: `${date}T23:59:59`,
    endDate: `${date}T00:00:00`,
  };
  const headers = {
    Authorization:
      await getToken(),
  };

  try {
    const response = await axios.get(url, { params, headers });
    return response.data[0].products;
  } catch (error) {
    console.error("Erro na requisição:", error);
  }
};

async function formatProduct(queryDate : string) {
    const products : Array<CodeProduct> = await fetchProductAvailability(queryDate);
    const waveSessions = products.filter(product => product.productType.id === 2);

    const availableShedules : Array<resumeProduct> = [];

    waveSessions.map(waveSession => {
        waveSession.schedules.map(schedule => {
            availableShedules.push({
                productId : waveSession.id,
                productName : waveSession.exhibitionName,
                scheduleId : schedule.id,
                time : schedule.name,
                availability : schedule.available,
                waveType : waveSession.waveLevel
            });
        });
    });

    return availableShedules;
};

export default formatProduct;