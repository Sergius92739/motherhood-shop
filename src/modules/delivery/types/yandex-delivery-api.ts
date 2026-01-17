// Пример интерфейсов для создания заявки (claim)
export interface YandexDeliveryPoint {
  coordinates: [number, number]; // [долгота, широта]
  address: string;
}

export interface YandexDeliveryItem {
  cost_value: string; // Стоимость товара
  dropoff_point: number; // Индекс точки выдачи
  quantity: number;
  title: string;
  weight: number; // кг
}

export interface YandexDeliveryRequest {
  items: YandexDeliveryItem[];
  route_points: YandexDeliveryPoint[];
  // ... другие поля по документации
}

export interface YandexDeliveryResponse {
  id: string;
  price: string;
  delivery_date: string;
  // ... другие поля ответа
}