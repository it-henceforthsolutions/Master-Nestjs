import { Types } from 'mongoose';
import { asyncScheduler } from 'rxjs';
import { Groups } from './schema/group.schema';

export class aggregate {
  static match = async (user_id: string, ids: Array<string>) => {
    try {
      return {
        $match: {
          $or: [
            { sent_to: new Types.ObjectId(user_id) },
            { sent_by: new Types.ObjectId(user_id) },
            { group_id: { $in: ids } },
          ],
        },
      };
    } catch (error) {
      throw error;
    }
  };

  static lookup_group = async () =>{
  try {
    return {
      $lookup: {
        from:"groups",
        let: { group_id: '$group_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ['$_id', '$$group_id'],
              },
            },
          },
        ],
        as: 'fetch_group',
      },
    };
  } catch (error) {
    throw error
  }
  }

  static unwindGroup = async () => {
    try {
      return {
        $unwind: {
          path: '$fetch_group',
          preserveNullAndEmptyArrays: true,
        },
      };
    } catch (error) {
      throw error;
    }
  };

  static set_data = async (user_id: any) => {
    try {
      return {
        $set: {
          other_user_id: {
            $cond: {
              if: {
                $eq: ['$sent_by', new Types.ObjectId(user_id)],
              },
              then: '$sent_to',
              else: '$sent_by',
            },
          },
        },
      };
    } catch (error) {
      throw error;
    }
  };

  static lookupUser = async () => {
    try {
      return {
        $lookup: {
          from: 'users',
          let: { other_user_id: '$other_user_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$other_user_id'],
                },
              },
            },
          ],
          as: 'fetch_user',
        },
      };
    } catch (error) {
      throw error;
    }
  };

  static unwindUser = async () => {
    try {
      return {
        $unwind: {
          path: '$fetch_user',
          preserveNullAndEmptyArrays: true,
        },
      };
    } catch (error) {
      throw error;
    }
  };

  static lookupMessage = async (user_id: any) => {
    try {
      return {
        $lookup: {
          from: 'messages',
          let: {
            user_id: user_id,
            conn_id: '$_id',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $ne: ['$sent_by', new Types.ObjectId(user_id)] },
                    { $eq: ['$connection_id', '$$conn_id'] },
                    {
                      $not: [
                        { $in: [new Types.ObjectId(user_id), '$read_by'] },
                      ],
                    },
                  ],
                },
              },
            },
          ],
          as: 'Messages',
        },
      };
    } catch (error) {
      throw error;
    }
  };

  static unread_messages = async () => {
    try {
      return {
        $set: {
          unread_messages: { $size: '$Messages' },
        },
        // $addFields: { unread_messages: { $size: "$Messages" } },
      };
    } catch (error) {
      throw error;
    }
  };

  static group_data = async (user_id: any) => {
    try { 
      return {
        $group: {
          _id: '$_id',
          connection_id: { $first: '$_id' },
          user_id: { $first: user_id },
          last_message: { $first: '$last_message' },
          other_user_id: { $first: '$other_user_id' },
          name: { $first:  { $ifNull: [ {$concat:['$fetch_user.first_name'," ",'$fetch_user.last_name']}, '$fetch_group.name'] }},
          profile_pic: { $first: { $ifNull: ['$fetch_user.profile_pic', '$fetch_group.image'] }},
          updated_at: { $first: '$updated_at' },
          created_at: { $first: '$created_at' },
          group_id: { $first: '$group_id' },
          unread_messages : { $first: '$unread_messages'},
        },
      };
    } catch (error) {
      throw error;
    }
  };

  static remove_same_user_data = async (user_id: any) => {
    try {
      return {
        $redact: {
          $cond: {
            if: {
              $eq: ['$other_user_id', new Types.ObjectId(user_id)],
            },
            then: '$$PRUNE',
            else: '$$KEEP',
          },
        },
      };
    } catch (error) {
      throw error;
    }
  };

  static facetData= async (skip: any, limit: any, pagin_status?:boolean)=>{
    if(pagin_status){
  
      return {
        $facet: {
        metadata: [{ $count: "count" }],
        data: [
          { $skip:skip },
          { $limit: limit },
        ],
        },
      };
    }else{
      return {
        $facet: {
        metadata: [{ $count: "count" }],
        data: [
        ],
        },
      };
    }
  
    }
  
}
