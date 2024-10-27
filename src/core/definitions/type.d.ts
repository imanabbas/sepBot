export type group_connect = {
  id: number;
  title: string;
  messages: alertMessage[];
  user_connect: {
    date: number;
    message_id: number;
    user_count: number;
    conected_user: conected_user[];
  };
};
export interface conected_user extends userData {
  chat_id: number;
}
export interface reciver_message extends userData {
  read: boolean;
  read_date: number;
}
export type group_data = {
  id: number;
  title: string;
};
export type userData = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
};
export type state = {
  step?: string;
  message?: string;
  data: string;
};
export interface stateObj {
  [key: string]: state;
}
export type alertMessage = {
  date: number;
  message: string;
  readBy: userData[];
  sentTo: reciver_message[];
};
export type queryData = {
  query: string;
  data: string[];
};
