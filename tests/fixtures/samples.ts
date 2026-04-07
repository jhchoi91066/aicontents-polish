/**
 * AI-generated HTML samples for testing.
 * Extracted from production data patterns.
 */

/** Clean content — no AI artifacts */
export const CLEAN_HTML = `
<h1>서울 카페 투어 가이드</h1>
<p>성수동에서 시작해 을지로까지, 직접 다녀온 카페 5곳을 소개한다.</p>
<h2>1. 카페 온도</h2>
<p>성수동 뒷골목에 있는 작은 카페다. 아메리카노가 4,500원인데, 산미가 적고 고소한 맛이 난다.</p>
<blockquote class="quote-block">주차는 어렵다. 대중교통을 추천한다.</blockquote>
<h2>2. 커피 한잔</h2>
<p>을지로 세운상가 근처 카페. 인테리어가 독특하고 조용하다.</p>
<table class="data-table">
<thead><tr><th>카페</th><th>가격</th><th>분위기</th></tr></thead>
<tbody>
<tr><td>카페 온도</td><td>4,500원</td><td>조용</td></tr>
<tr><td>커피 한잔</td><td>5,000원</td><td>독특</td></tr>
</tbody>
</table>
`;

/** Content with AI smell patterns (Korean) */
export const AI_SMELL_KO = `
<h1>결론부터 말씀드리면, 서울 맛집 10곳 추천</h1>
<p>이번 글에서는 서울의 숨겨진 맛집을 종합적으로 정리해 드릴게요. IT직장인으로서 3년 동안 다니면서 정리한 곳들입니다.</p>
<p>정말 최고의 선택이었어요. 90% 이상의 여행자가 만족하는 곳이에요.</p>
<p>기본적으로 이러한 점에서 효율적으로 다양한 측면에서 살펴보겠습니다.</p>
<h2>1. 종로 맛집</h2>
<p>제 경험상 직접 경험해보니 이 곳은 강력 추천합니다. 꼭 추천드려요.</p>
<p>제 영상에서 보셨듯이 이 방법이 최고입니다.</p>
`;

/** Content with AI smell patterns (English) */
export const AI_SMELL_EN = `
<h1>10 Best Coffee Shops to Elevate Your Morning</h1>
<p>I personally think these coffee shops are a game-changer. Let me delve into this tapestry of caffeinated realm.</p>
<p>It's worth noting that these places unleash the best flavors. In my opinion, the landscape of coffee has changed.</p>
<p>In conclusion, all in all, it should be noted that these are the best spots. Ultimately, at the end of the day, they leverage robust and seamless experiences.</p>
<p>As I mentioned before, in my previous video, I covered the top spots.</p>
`;

/** Content with banned tokens */
export const BANNED_TOKENS_MIXED = `
<p>This holistic approach is pivotal to understanding the multifaceted nature of the problem.</p>
<p>We must harness this meticulous strategy to foster a deep dive into the subject.</p>
<p>획기적인 접근으로 필수불가결한 변화를 다각적으로 알아보겠습니다.</p>
<p>에 대해 알아보았습니다. 마무리하겠습니다.</p>
`;

/** Content with punctuation issues */
export const PUNCTUATION_ISSUES = `
<p>This is bad. , This continues with more text.</p>
<p>Double comma,, appears here and there,, too.</p>
<p>Period follows period. . Like this one.</p>
<p>Comma before period, . Strange indeed.</p>
<p>Question mark comma? , Answer follows.</p>
`;

/** Content with phantom references */
export const PHANTOM_REFS_KO = `
<p>제 영상에서 보셨듯이 이 방법이 최고입니다.</p>
<p>이전 글에서 말씀드린 대로 진행하면 됩니다.</p>
<p>저번에 말씀드린 내용을 참고하세요.</p>
<p>제 채널에서 확인하실 수 있습니다.</p>
`;

export const PHANTOM_REFS_EN = `
<p>As I mentioned before, this is important.</p>
<p>In my previous video, we covered this topic thoroughly.</p>
<p>If you saw my last article, you'd know the answer.</p>
<p>On my channel, I explain this in detail.</p>
`;

/** Content with heading hierarchy issues */
export const BAD_HEADING_HIERARCHY = `
<h1>Main Title</h1>
<h1>Second H1 Should Be H2</h1>
<h3>Skipped H2 Level</h3>
<h2>Proper H2</h2>
<h4>Skipped H3</h4>
`;

/** Content with keyword stuffing */
export const KEYWORD_STUFFING = `
<h2>Article Content</h2>
<p>This is the actual content of the article.</p>
<h2>Related Topics</h2>
<ul>
<li>Topic 1</li>
<li>Topic 2</li>
<li>Topic 3</li>
<li>Topic 4</li>
<li>Topic 5</li>
</ul>
<h3>See Also</h3>
<ol>
<li>Link A</li>
<li>Link B</li>
<li>Link C</li>
<li>Link D</li>
</ol>
`;

/** Content with WordPress artifacts */
export const WP_ARTIFACTS = `
<script src="/wp-content/plugins/analytics/script.js"></script>
<link href="/wp-content/themes/mytheme/style.css">
<p>Actual content here.</p>
<a href="/wp-admin/edit.php">Admin Link</a>
<img src="/wp-content/themes/mytheme/placeholder.jpg">
`;

/** Content with fake/placeholder images */
export const FAKE_IMAGES = `
<figure><img src="https://example.com/placeholder.jpg"><figcaption>Figure 1</figcaption></figure>
<img src="placeholder.png">
<img src="sample.jpg">
<img src="https://cdn.realsite.com/actual-photo.webp">
`;

/** Content needing title-body consistency check */
export const TITLE_BODY_MISMATCH = {
	title: "서울 맛집 10곳 추천",
	html: "<h2>1. 종로</h2><h2>2. 강남</h2><h2>3. 홍대</h2>",
};

export const TITLE_BODY_MATCH = {
	title: "카페 3곳 추천",
	html: "<h2>1. 카페A</h2><h2>2. 카페B</h2><h2>3. 카페C</h2>",
};

/** Sentence variance samples */
export const LOW_VARIANCE = `
<p>I like coffee. I drink tea. I eat cake. I go out. I come back. I rest now.</p>
`;

export const HIGH_VARIANCE = `
<p>Coffee is good. I've been visiting this particular café in Gangnam every single weekend for the past three months, and the experience has been consistently delightful. Great spot.</p>
`;

/** MDX syntax edge cases */
export const MDX_UNBALANCED = "Some text ```javascript\ncode here\n";
export const MDX_CURLY_BRACES = "Text with {variable} and {another} outside code blocks";
export const MDX_BALANCED = "Text ```js\ncode\n``` more text";

/** Full HTML document (for unwrapHtmlWrapper) */
export const FULL_HTML_DOC = `<!DOCTYPE html><html><head><title>Page Title</title><meta charset="utf-8"></head><body><h1>Content</h1><p>Text</p></body></html>`;

/** Duplicate content */
export const DUPLICATE_CONTENT = `
<h2>Best Practices</h2>
<p>First section content.</p>
<h2>Best Practices</h2>
<p>Second section content.</p>
<section class="sources"><h2>Sources</h2><ul><li>Source 1</li></ul></section>
<p>Content after sources that should be removed.</p>
<section class="sources"><h2>Sources</h2><ul><li>Source 2</li></ul></section>
`;

/** Korean orphaned particles */
export const ORPHANED_PARTICLES = `
<p>단어 은 의 다른단어가 있습니다.</p>
<p>링크드인은 의 권위자가 여러 명 있습니다.</p>
`;

/** Microdata test content */
export const MICRODATA_ARTICLE = `
<h1>Article Title</h1>
<p>Article description paragraph.</p>
<img src="photo.jpg">
<time datetime="2026-03-29">March 29, 2026</time>
`;

export const MICRODATA_FAQ = `
<details><summary>What is X?</summary><p>Answer to X.</p></details>
<details><summary>Why Y?</summary><p>Answer to Y.</p></details>
<details><summary>How Z?</summary><p>Answer to Z.</p></details>
`;
