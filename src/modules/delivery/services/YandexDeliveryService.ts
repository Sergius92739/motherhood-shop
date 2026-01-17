import { YandexDeliveryClient } from '../utils/api-client';
import {
  YandexDeliveryRequest,
  YandexDeliveryResponse,
} from '../types/yandex-delivery-api';

export class YandexDeliveryService {
  private client: YandexDeliveryClient;

  constructor(apiToken: string) {
    this.client = new YandexDeliveryClient(apiToken);
  }

  /**
   * Создание заявки на доставку
   */
  async createClaim(
    requestData: YandexDeliveryRequest
  ): Promise<YandexDeliveryResponse> {
    try {
      // Эндпоинт из документации: /v2/claims/create
      const response = await this.client.post<YandexDeliveryResponse>(
        '/v2/claims/create',
        requestData
      );
      return response;
    } catch (error) {
      // Логика повторных попыток, уведомлений и т.д.
      console.error('Failed to create delivery claim:', error);
      throw error;
    }
  }

  /**
   * Получение информации о заявке
   */
  async getClaimInfo(claimId: string) {
    return this.client.post(`/v2/claims/info`, { claim_id: claimId });
  }

  /**
   * Подтверждение заявки
   */
  async acceptClaim(claimId: string) {
    return this.client.post(`/v2/claims/accept`, { claim_id: claimId });
  }

  // Методы для получения истории заказов, расчета стоимости и т.д.
}