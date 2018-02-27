import fetch from 'cross-fetch'

export const REQUEST_POST = 'REQUEST_POSTS'

function requestPosts(subreddit){
	return{
		type: REQUEST_POST,
		subreddit
	}
}

export const RECEIVE_POSTS = 'RECEIVE_POSTS'

function receivePosts(subreddit, json){
	return {
		type: RECEIVE_POSTS,
		subreddit,
		posts: json.data.children.map(child => child.data),
		receivedAt: Date.now()
	}
}

export const INVALIDATE_SUBREDDIT = 'INVALIDATE_SUBREDDIT'
export function invalidateSubreddit(subreddit) {
  return {
    type: INVALIDATE_SUBREDDIT,
    subreddit
  }
}

// Gặp THUNK ACTION CREATOR đầu tiên
// Tuy nhiên, bên trong nó khác, ban sẽ dùng nó giống như bất kỳ action creator nào khác:
// store.dispatch(fetchPosts('reactjs'))

export function fetchPosts(subreddit) {
	// Thunk middleware  biết làm sao để xử lý functions.
	// Nó vượt qua phương thức dispatch như một đối số đến the function
	// do đó tạo ra nó có thể dispatch actions của riêng nó
	return function(dispatch){
		// Dispatch trước tiên: the app state được xác nhận
		// là lúc gọi API đang bắt đầu

		dispatch(requestPosts(subreddit))

		// Function đã gọi bởi thunk middleware có thể trả về 1 giá trị
		// Nó được thông qua như giá trị trả về của phương thức dispatch

		// Trong trường hợp này, chúng ta trả về một promise để đợi.
		// Cái này không được yêu cầu bởi thunk middleware, nhưng nó tiện lợi cho chúng ta

		return fetch(`https://www.reddit.com/r/${subreddit}.json`)
			.then(
				response => response.json(),
				// Đừng dùng catch, bởi vì đó cũng sẽ catch
				// bất kỳ errors nào trong dispatch và kết quả render,
				// nguyên nhân là một lần lặp của lỗi 'Unexpected batch number'
				// https://github.com/facebook/react/issues/6895
				error => console.log('An error occurred.', error)	
			)
			.then(json=>
				// Chúng ta có thể dispatch nhiều lần!
				// Ở đây, chúng ta cập nhật app state với kết của của API call

				dispatch(receivePosts(subreddit, json))
			)

	}
}