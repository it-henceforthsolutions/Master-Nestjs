import {Types} from 'mongoose'
import { Users } from 'src/users/schema/users.schema';


export class aggregate2{
	static matchGroupMember=async(group_id: any)=> {
		try {
			return {
				$match: {
					group_id: new Types.ObjectId(group_id)
				}
			};
		}
		catch (error) {
			throw error;
		}
	};

static lookupUser=async()=>{
		try {
			return {
				$lookup: {
					from: Users.name,
					let: { _id: "$user_id" },
					pipeline: [
						{
							$match: {
								$expr: {
									$eq: ["$_id", "$$_id"],
								},
							},
						},
					],
					as: "fetch_user",
				},
			};
		} 
		catch (error) {
			throw error;
		}
	};

static unwindUser=async() => {
		try {
			return {
				$unwind: {
					path: "$fetch_user",
					preserveNullAndEmptyArrays: true,
				},
			};
		} 
		catch (error) {
			throw error;
		}
	};


  static project = async () => {
		try {
			return {
				$project: {
					_id: "$member.fetch_user._id",
				    socket_id: "$member.fetch_user.socket_id"
				}
			}
		}
		catch (error) {
			throw error;
		}
	}


// 	static remove_same_user_data=async(user_id: any)=> {
// 		try {
// 			return {
// 				$redact: {
// 					$cond:{
// 						if: {
// 							$eq: ["$other_user_id", new Types.ObjectId(user_id)],
// 						},
// 						then: "$$PRUNE",
// 						else: "$$KEEP"
// 					}
// 				}
// 			}
// 		}
// 		catch (error) {
// 			throw error;
// 		}
// 	};


static matchGroup=async()=> {
	try {
		return {
			$match: {
			}
		};
	}
	catch (error) {
		throw error;
	}
}

static lookupMember=async(user_id:string)=>{
	try {
		return {
			$lookup: {
				from: "members",
				let: { group_id: "$_id" },
				pipeline: [
					{
						$match: {
							$expr: {
								$and:[
									{$eq: ["$group_id", "$$group_id"]},
									{$eq: ["$user_id", new Types.ObjectId(user_id)]},
								]
							},
						},
					},
				],
				as: "fetch_member",
			},
		};
	} 
	catch (error) {
		throw error;
	}
};

static unwindMember=async() => {
	try {
		return {
			$unwind: {
				path: "$fetch_member",
				preserveNullAndEmptyArrays: false,
			},
		};
	} 
	catch (error) {
		throw error;
	}
};

static group_data = async () => {
	try {
		return {
			$group: {
				_id: "$_id",
                name: { $first: "$name" },
				image: { $first: "$image" },
				description: { $first: "$description" },
				created_by: { $first: "$created_by"},
				role: { $first:"$fetch_member.role"},
				updated_at: { $first: "$updated_at" },
				created_at: { $first: "$created_at" }
			}
		}
	}
	catch (error) {
		throw error;
	}
}

static sortData= async (sort_by:any) => {
	try {
	  return {
		$sort: sort_by
	  };
	}
	catch (err) {
	  throw err;
	}
}

static facetData= async (skip: any, limit: any)=>{
	console.log(skip, limit)
	return {
	  $facet: {
		metadata: [{ $count: "count" }],
		data: [
		  { $skip:skip },
		  { $limit: limit },
		],
	  },
	};
  }


}