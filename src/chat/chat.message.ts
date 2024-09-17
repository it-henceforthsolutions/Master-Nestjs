const shared_chat_events = {
    connected: 'connected',
    disconnected:"disconnected",
    create_connection: "create_connection",
    list_connection: "list_connection",
    get_all_message: "get_all_message",
    deliver_message: "deliver_message",
    read_message: "read_message",
    leave_connection: "leave_connection",
    remove_member: "remove_member",
    clear_chat: "clear_chat",
    edit_message: "edit_message",
    delete_message: "delete_message",
    is_typing: "is_typing",
    group_add_member: "group_add_member",
    mute_unmute: "mute_unmute",
    add_pins: "add_pins",
    remove_pins: "remove_pins",
    get_pins: "get_pins",
    start_call: "start_call",
    join_call: "join_call",
    leave_call: "leave_call",
    call_detail: "call_detail",
};

const chat_emitter = {
    ...shared_chat_events,
    error: 'error',
    get_message: "get_message",
};

const chat_listener = {
    ...shared_chat_events,
    send_message: "send_message",
};

export {
 chat_emitter, chat_listener
}