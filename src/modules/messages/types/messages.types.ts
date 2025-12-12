export interface SendMessageDto {
  content: string;
  receiverId: string;
}

export interface MessageQueryParams {
  page?: number;
  limit?: number;
  conversationWith?: string;
}

