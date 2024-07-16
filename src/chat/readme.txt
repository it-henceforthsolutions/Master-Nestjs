sockets

emitter                 -   reciever

                             error    always listen (for all the error in any sockets) 

create_connection       -     create_connection
{
    "sent_to"  : "user_id", 
    "group_id" : "group_id"   
}

send_message             -   get_message
{
   "connection_id": "66570d67892bc5d67f286536",
   "message_id" :   "message_id"
   "message":"22222gsfgsdfgfsdfadfas",
   "message_type": "TEXT",                  ///  [null, 'TEXT', 'IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT', 'GROUP_LINK'];
   "type":"NORMAL",                        //    [null, 'NORMAL', 'REPLY', 'FORWARDED', 'DELETED'];
   "media_url": "media_url"
}

list_connection    -       list_connection
get_all_message    -       get_all_message

read_message       -       read_message
{
    "message_id": string
}
deliver_message -  deliver_message
{
    "message_id" -  string
}

delete_message     -       delete_message
{
    "message_id" : "message_id",
    "deleted_type" : "ME"              //ME, BOTH
}

leave_connection   -      leave_connection
{
    "connection_id" : "connection_id" 
}
is_typing        -    is_typing 
{
    "connection_id" : "connection_id" 
}

group_add_member       -  group_add_member
{
  connection_id:string;
  group_id:string;
  members:string[];
}

mute_unmute     -   mute_unmute
{
  mute_upto: number;               /// 0 for unmute, 1 for 8hr, 2 for a week , 3 always
  connection_id: string;
}

add_pins      -            add_pins                      /// to pin items
{
    connection_id:string,
     message_id :string
}

get_pins -  get_pins     
{
    connection_id:string;
}

start_call    -    start_call 
{
   users_ids:string,
   type:string,                            enum call_type  {"audio","video"}
   connection_id:string
}

join_call   - join_call
{
    call_id: string
}

leave_call    -   leave_call 
{
    call_id:string
}

call_detail   - call_detail 
{
    call_id: string
}


