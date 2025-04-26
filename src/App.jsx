import React, { useState, useEffect, useCallback } from 'react';
// Import the CSS file for component styles
import './App.css';
// Import Font Awesome components and icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMoon, faSun, faEye, faEyeSlash, faArrowUp, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

// --- Helper Functions ---
const STORAGE_KEY = 'nycBakeryPostsReact';

const getDefaultPosts = () => [
    { id: Date.now() + 1, title: "Hani's Bakery - Hidden Gem?", content: "Heard great things about their croissants. Has anyone tried?", imageUrl: "https://placehold.co/600x400/FFF7ED/4A2C2A?text=Hani's+Bakery", timestamp: Date.now() - 86400000, upvotes: 15, comments: [{ user: "BakerFan", text: "Yes! Their almond croissant is divine." }, { user: "NYCFoodie", text: "Definitely worth the trip." }] },
    { id: Date.now() + 2, title: "Librae Bakery - Worth the Hype?", content: "Seeing Librae everywhere online. Is it really that good? Planning to visit soon.", imageUrl: "https://placehold.co/600x400/E11D48/FFFFFF?text=Librae+Bakery", timestamp: Date.now() - 3600000, upvotes: 25, comments: [{ user: "PastryLover", text: "The pistachio rose croissant is a must-try!" }] },
    { id: Date.now() + 3, title: "Claude's Patisserie - Classic French", content: "Claude's is an institution. Their classic pastries are consistently excellent. What's your favorite?", imageUrl: "", timestamp: Date.now() - 172800000, upvotes: 10, comments: [] }
];

const getPostsFromStorage = () => {
    const storedPosts = localStorage.getItem(STORAGE_KEY);
    try {
        const parsedPosts = storedPosts ? JSON.parse(storedPosts) : getDefaultPosts();
        return parsedPosts.map(post => ({
            ...post,
            comments: Array.isArray(post.comments) ? post.comments : []
        }));
    } catch (error) {
        console.error("Error parsing posts from localStorage:", error);
        return getDefaultPosts();
    }
};

const savePostsToStorage = (posts) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
};

// Basic HTML escaping (remains the same)
const escapeHTML = (str) => {
     if (!str) return '';
     const div = document.createElement('div');
     div.textContent = str;
     return div.innerHTML;
};

// --- React Components ---

// Header Component (Uses CSS classes from App.css)
function Header({ onOpenCreateModal, onToggleTheme, currentTheme, onToggleContentView, showFullContent }) {
    return (
        // Use 'header' class for main header styling
        <header className="header">
            {/* Use 'container' class for centering content */}
            <div className="container">
                {/* Use 'header-title' for specific title styling */}
                <h1 className="header-title">NYC Best Bakeries Forum</h1>
                {/* Use 'header-controls' for button grouping */}
                <div className="header-controls">
                    <button
                        onClick={onToggleTheme}
                        // Use general 'btn', type 'btn-secondary', and shape 'btn-icon' classes
                        className="btn btn-secondary btn-icon"
                        title={currentTheme === 'light' ? "Switch to Dark Theme" : "Switch to Light Theme"}
                        aria-label="Toggle theme"
                    >
                        <FontAwesomeIcon icon={currentTheme === 'light' ? faMoon : faSun} />
                    </button>
                    <button
                        onClick={onToggleContentView}
                        className="btn btn-secondary btn-icon"
                        title={showFullContent ? "Hide Full Content on Feed" : "Show Full Content on Feed"}
                        aria-label="Toggle full content view"
                    >
                        <FontAwesomeIcon icon={showFullContent ? faEyeSlash : faEye} />
                    </button>
                    <button onClick={onOpenCreateModal} className="btn btn-primary">
                        <FontAwesomeIcon icon={faPlus} style={{ marginRight: '0.25rem' }} /> Create Post
                    </button>
                </div>
            </div>
        </header>
    );
}

// PostImage Component (Uses CSS classes from App.css)
function PostImage({ src, alt }) {
    const [imgSrc, setImgSrc] = useState(src);
    const [error, setError] = useState(false);

    useEffect(() => {
        setImgSrc(src);
        setError(false);
    }, [src]);

    const handleImageError = () => {
        setError(true);
    };

    if (error || !imgSrc) {
        // Use 'image-placeholder' class
        return (
            <div className="image-placeholder">
                <span>Image not available</span>
            </div>
        );
    }

    // Standard img tag, styled globally or via parent
    return (
        <img
            src={imgSrc}
            alt={alt}
            // No specific class needed if handled by global 'img' styles in App.css
            loading="lazy"
            onError={handleImageError}
        />
    );
}


// PostCard Component (Uses CSS classes from App.css)
function PostCard({ post, onOpenDetail, showFullContent }) {
    const creationDate = new Date(post.timestamp).toLocaleString();

    return (
        // Use 'post-card' class
        <div className="post-card">
            <div>
                {/* Use 'post-card-title' */}
                <h3
                    className="post-card-title"
                    onClick={() => onOpenDetail(post.id)}
                >
                    {escapeHTML(post.title)}
                </h3>
                {/* Use 'post-card-meta' */}
                <p className="post-card-meta">Posted: {creationDate}</p>
                {/* Use 'post-card-upvotes' */}
                <p className="post-card-upvotes">
                    <FontAwesomeIcon icon={faArrowUp} /> Upvotes: <span id={`upvotes-feed-${post.id}`}>{post.upvotes}</span>
                </p>
                {/* Conditional rendering uses CSS classes for visibility */}
                 {showFullContent && post.content && (
                     <p className="post-card-content-preview post-content-full">
                         {escapeHTML(post.content.substring(0, 100) + (post.content.length > 100 ? '...' : ''))}
                     </p>
                 )}
                 {showFullContent && post.imageUrl && (
                     <div className="post-card-image-preview post-image-full">
                          <PostImage src={post.imageUrl} alt={post.title} />
                     </div>
                 )}
            </div>
            {/* Use 'post-card-actions' */}
            <div className="post-card-actions">
                <button
                    // Apply button styles and specific modifiers
                    className="btn btn-secondary btn-full-width btn-small-text"
                    onClick={() => onOpenDetail(post.id)}
                >
                    View Details
                </button>
            </div>
        </div>
    );
}

// PostList Component (Uses CSS classes from App.css)
function PostList({ posts, onOpenDetail, showFullContent }) {
     if (posts.length === 0) {
         // Use 'no-posts-message' class
         return (
             <p className="no-posts-message">
                 No posts match your criteria. Try creating one!
             </p>
         );
     }

    // Use 'posts-feed' class for the grid layout
    return (
        <div className="posts-feed">
            {posts.map(post => (
                <PostCard
                    key={post.id}
                    post={post}
                    onOpenDetail={onOpenDetail}
                    showFullContent={showFullContent}
                />
            ))}
        </div>
    );
}

// Comment Component (Uses CSS classes from App.css)
function Comment({ comment }) {
    return (
        // Use 'comment-card' class
        <div className="comment-card">
            {/* Use 'comment-text' and utility 'whitespace-pre-wrap' */}
            <p className="comment-text whitespace-pre-wrap">{escapeHTML(comment.text)}</p>
            {/* Use 'comment-user' */}
            <p className="comment-user">- {escapeHTML(comment.user || 'Anonymous')}</p>
        </div>
    );
}

// CommentForm Component (Uses CSS classes from App.css)
function CommentForm({ postId, onAddComment }) {
    const [commentText, setCommentText] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!commentText.trim()) return;
        onAddComment(postId, commentText);
        setCommentText('');
    };

    return (
        // No specific form class needed unless more styling required
        <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
            <label htmlFor={`comment-text-${postId}`} style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Leave a Comment:</label>
            <textarea
                id={`comment-text-${postId}`}
                rows="3"
                required
                // Input/textarea styles are handled globally in index.css
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write your comment here..."
                style={{ marginBottom: '0.5rem' }} // Add specific spacing if needed
            ></textarea>
            {/* Use wrapper div for alignment if needed */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary">Add Comment</button>
            </div>
        </form>
    );
}


// PostDetailModal Component (Uses CSS classes from App.css)
function PostDetailModal({ post, onClose, onUpvote, onAddComment, onEdit, onDelete }) {
    if (!post) return null;

    const creationDate = new Date(post.timestamp).toLocaleString();
    const comments = Array.isArray(post.comments) ? post.comments : [];

    return (
        // Use 'modal-backdrop' for the outer overlay
        <div className="modal-backdrop" onClick={onClose}>
             {/* Use 'modal-content' for the inner box */}
             <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                 {/* Use 'modal-close-button' */}
                 <button className="modal-close-button" onClick={onClose} aria-label="Close post details">&times;</button>
                 {/* Use 'modal-scrollable-content' */}
                 <div className="modal-scrollable-content">
                     {/* Use specific classes for detail elements */}
                     <h2 className="post-detail-title">{escapeHTML(post.title)}</h2>
                     <p className="post-detail-meta">Posted: {creationDate}</p>

                     {post.content && <p className="post-detail-content whitespace-pre-wrap">{escapeHTML(post.content)}</p>}

                     {post.imageUrl && (
                         <div className="post-detail-image-wrapper">
                             <PostImage src={post.imageUrl} alt={post.title} />
                         </div>
                     )}

                     <div className="post-detail-upvote-section">
                         <button
                             className="btn btn-primary btn-icon"
                             onClick={() => onUpvote(post.id)}
                             title="Upvote"
                             aria-label="Upvote post"
                         >
                             <FontAwesomeIcon icon={faArrowUp} />
                         </button>
                         <span className="post-detail-upvote-count">Upvotes: <span id={`upvotes-detail-${post.id}`}>{post.upvotes}</span></span>
                     </div>

                     <hr /> {/* Styled globally */}

                     <h3 className="comments-section-title">Comments</h3>
                     <div id={`comments-section-${post.id}`} className="comments-list">
                         {comments.length > 0 ? (
                             comments.map((comment, index) => <Comment key={index} comment={comment} />)
                         ) : (
                             <p className="no-comments-text">No comments yet.</p>
                         )}
                     </div>

                     <CommentForm postId={post.id} onAddComment={onAddComment} />
                 </div>
                 {/* Use 'post-detail-action-buttons' for positioning */}
                 <div className="post-detail-action-buttons">
                     <button
                         className="btn btn-secondary btn-icon"
                         onClick={() => onEdit(post.id)}
                         title="Edit Post"
                         aria-label="Edit post"
                     >
                         <FontAwesomeIcon icon={faEdit} />
                     </button>
                     <button
                         className="btn btn-danger btn-icon"
                         onClick={() => onDelete(post.id)}
                         title="Delete Post"
                         aria-label="Delete post"
                     >
                         <FontAwesomeIcon icon={faTrash} />
                     </button>
                 </div>
             </div>
        </div>
    );
}

// CreateEditModal Component (Uses CSS classes from App.css)
function CreateEditModal({ isOpen, onClose, onSave, initialData }) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [postId, setPostId] = useState(null);

    useEffect(() => {
        if (isOpen && initialData) {
            setTitle(initialData.title || '');
            setContent(initialData.content || '');
            setImageUrl(initialData.imageUrl || '');
            setPostId(initialData.id);
        } else if (isOpen) {
            setTitle('');
            setContent('');
            setImageUrl('');
            setPostId(null);
        }
    }, [initialData, isOpen]);

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!title.trim()) {
            // Changed alert message to reflect the new label
            alert("Bakery's Name is required!");
            return;
        }
        onSave({ id: postId, title, content, imageUrl });
        onClose();
    };

    const handleClose = () => {
         onClose();
    }

    if (!isOpen) return null;

    return (
        // Use 'modal-backdrop'
        <div className="modal-backdrop" onClick={handleClose}>
            {/* Use 'modal-content' */}
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                {/* Use 'modal-close-button' */}
                <button className="modal-close-button" onClick={handleClose} aria-label="Close create/edit post form">&times;</button>
                {/* Use 'modal-title' */}
                <h2 className="modal-title">
                    {postId ? 'Edit Post' : 'Create New Post'}
                </h2>
                <form onSubmit={handleSubmit}>
                    {/* Use 'modal-form-field' for spacing */}
                    <div className="modal-form-field">
                        {/* *** MODIFIED LABEL TEXT HERE *** */}
                        <label htmlFor="post-title">Bakery's Name <span className="text-danger">*</span></label>
                        <input
                            type="text"
                            id="post-title" // Keep id the same for association
                            // Global input styles apply
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            aria-required="true"
                        />
                    </div>
                    <div className="modal-form-field">
                        <label htmlFor="post-content">Content (Optional)</label>
                        <textarea
                            id="post-content"
                            rows="4"
                            // Global textarea styles apply
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Share details about the bakery..."
                        ></textarea>
                    </div>
                    <div className="modal-form-field">
                        <label htmlFor="post-image-url">Image URL (Optional)</label>
                        <input
                            type="url"
                            id="post-image-url"
                            placeholder="https://example.com/image.jpg"
                            // Global input styles apply
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                        />
                    </div>
                    {/* Use 'modal-actions' for button alignment */}
                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={handleClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary">
                            {postId ? 'Save Changes' : 'Create Post'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}


// Main App Component (Uses CSS classes from App.css)
function App() {
    const [posts, setPosts] = useState([]);
    const [currentSort, setCurrentSort] = useState('newest');
    const [currentSearch, setCurrentSearch] = useState('');
    const [currentTheme, setCurrentTheme] = useState(() => localStorage.getItem('theme') || 'light');
    const [showFullContent, setShowFullContent] = useState(() => localStorage.getItem('showFullContent') === 'true');
    const [isCreateEditModalOpen, setIsCreateEditModalOpen] = useState(false);
    const [editingPostData, setEditingPostData] = useState(null);
    const [detailPostId, setDetailPostId] = useState(null);

    // --- Effects (Remain the same logic) ---
    useEffect(() => {
        setPosts(getPostsFromStorage());
    }, []);

    useEffect(() => {
        savePostsToStorage(posts);
    }, [posts]);

    useEffect(() => {
        const body = document.body;
        body.className = ''; // Clear previous themes
        body.classList.add(currentTheme + '-theme');
        localStorage.setItem('theme', currentTheme);
    }, [currentTheme]);

    useEffect(() => {
        localStorage.setItem('showFullContent', showFullContent);
    }, [showFullContent]);

     useEffect(() => {
         const body = document.body;
         if (showFullContent) {
             body.classList.add('show-full-content');
         } else {
             body.classList.remove('show-full-content');
         }
         return () => body.classList.remove('show-full-content');
     }, [showFullContent]);

     useEffect(() => {
         const body = document.body;
         const isModalOpen = isCreateEditModalOpen || detailPostId !== null;
         const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
         if (isModalOpen) {
             body.style.overflow = 'hidden';
             body.style.paddingRight = `${scrollbarWidth}px`; // Prevent content shift
         } else {
             body.style.overflow = '';
             body.style.paddingRight = '';
         }
         return () => {
             body.style.overflow = '';
             body.style.paddingRight = '';
         };
     }, [isCreateEditModalOpen, detailPostId]);


    // --- Event Handlers (Remain the same logic) ---
    const handleToggleTheme = () => setCurrentTheme(prev => prev === 'light' ? 'dark' : 'light');
    const handleToggleContentView = () => setShowFullContent(prev => !prev);
    const handleOpenCreateModal = () => { setEditingPostData(null); setIsCreateEditModalOpen(true); };
    const handleOpenEditModal = (postId) => {
        const postToEdit = posts.find(p => p.id === postId);
        if (postToEdit) { setEditingPostData(postToEdit); setDetailPostId(null); setIsCreateEditModalOpen(true); }
    };
    const handleOpenDetailModal = useCallback((postId) => { setDetailPostId(postId); setIsCreateEditModalOpen(false); }, []);
    const handleCloseModal = () => { setIsCreateEditModalOpen(false); setDetailPostId(null); setEditingPostData(null); };
    const handleSavePost = (postData) => {
        setPosts(prevPosts => {
            if (postData.id) {
                return prevPosts.map(p => p.id === postData.id ? { ...p, ...postData } : p);
            } else {
                const newPost = { ...postData, id: Date.now(), timestamp: Date.now(), upvotes: 0, comments: [] };
                return [newPost, ...prevPosts];
            }
        });
    };
    const handleDeletePost = (postId) => {
        if (window.confirm('Are you sure?')) {
            setPosts(prevPosts => prevPosts.filter(p => p.id !== postId));
            handleCloseModal();
        }
    };
    const handleUpvotePost = (postId) => {
        setPosts(prevPosts => prevPosts.map(p => p.id === postId ? { ...p, upvotes: p.upvotes + 1 } : p));
    };
    const handleAddComment = (postId, commentText) => {
        setPosts(prevPosts =>
            prevPosts.map(p => {
                if (p.id === postId) {
                    const newComment = { user: "GuestUser", text: commentText };
                    const comments = Array.isArray(p.comments) ? p.comments : [];
                    return { ...p, comments: [...comments, newComment] };
                }
                return p;
            })
        );
    };

    // --- Filtering and Sorting (Remains the same logic) ---
    const filteredAndSortedPosts = React.useMemo(() => {
        return posts
            .filter(post => post.title.toLowerCase().includes(currentSearch.toLowerCase()))
            .sort((a, b) => {
                switch (currentSort) {
                    case 'oldest': return a.timestamp - b.timestamp;
                    case 'upvotes': return b.upvotes - a.upvotes;
                    default: return b.timestamp - a.timestamp;
                }
            });
    }, [posts, currentSearch, currentSort]);

    const detailPost = React.useMemo(() => {
         return posts.find(p => p.id === detailPostId) || null;
     }, [posts, detailPostId]);


    // --- Render ---
    return (
        // Use 'app-container' class
        <div className={`app-container ${currentTheme}-theme`}>
            <Header
                onOpenCreateModal={handleOpenCreateModal}
                onToggleTheme={handleToggleTheme}
                currentTheme={currentTheme}
                onToggleContentView={handleToggleContentView}
                showFullContent={showFullContent}
            />

            {/* Use 'main-content' and 'container' classes */}
            <main className="main-content container">
                {/* Use 'controls-bar' class */}
                <div className="controls-bar">
                    {/* Use wrapper classes for layout */}
                    <div className="search-input-wrapper">
                        <label htmlFor="search-input" className="sr-only">Search by Title</label>
                        <input
                            type="text"
                            id="search-input"
                            placeholder="Search by title..."
                            // Global input styles apply
                            value={currentSearch}
                            onChange={(e) => setCurrentSearch(e.target.value)}
                        />
                    </div>
                    <div className="sort-select-wrapper">
                        <label htmlFor="sort-select" className="sr-only">Sort by</label>
                        <select
                            id="sort-select"
                            // Global select styles apply
                            value={currentSort}
                            onChange={(e) => setCurrentSort(e.target.value)}
                        >
                            <option value="newest">Sort by Newest</option>
                            <option value="oldest">Sort by Oldest</option>
                            <option value="upvotes">Sort by Upvotes</option>
                        </select>
                    </div>
                </div>

                <PostList
                    posts={filteredAndSortedPosts}
                    onOpenDetail={handleOpenDetailModal}
                    showFullContent={showFullContent}
                />
            </main>

            {/* Modals are rendered conditionally */}
            <CreateEditModal
                isOpen={isCreateEditModalOpen}
                onClose={handleCloseModal}
                onSave={handleSavePost}
                initialData={editingPostData}
            />

            <PostDetailModal
                post={detailPost}
                onClose={handleCloseModal}
                onUpvote={handleUpvotePost}
                onAddComment={handleAddComment}
                onEdit={handleOpenEditModal}
                onDelete={handleDeletePost}
            />
        </div>
    );
}

export default App;


