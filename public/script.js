/**
 * Todo 리스트 애플리케이션 인터랙션 스크립트 (script.js)
 * 기능: 백엔드 API 연동 (GET/POST/PUT/DELETE), 할 일 추가, 완료 체크 토글, 인라인 수정/저장/취소, 삭제, 진행률 실시간 갱신
 */

document.addEventListener("DOMContentLoaded", function () {
  // DOM 요소 참조
  const todoForm = document.getElementById("todoForm");
  const todoInput = document.getElementById("todoInput");
  const todoList = document.getElementById("todoList");
  const countInfo = document.getElementById("countInfo");
  const statusBadge = document.getElementById("statusBadge");

  /**
   * 상태 요약 푸터 바 갱신 함수 (전체 개수, 완료 개수, 진행률 %)
   */
  function updateSummary() {
    const items = todoList.querySelectorAll(".todo-item");
    const total = items.length;
    const completed = todoList.querySelectorAll(".todo-item.completed").length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    countInfo.innerHTML = `전체 <strong>${total}</strong>개 중 <strong>${completed}</strong>개 완료`;
    statusBadge.textContent = `오늘 진행률 ${percentage}%`;
  }

  /**
   * 서버에서 받은 Todo 데이터로 li 요소 생성
   * @param {Object} todo - {id, title, isDone, createdAt}
   * @returns {HTMLElement} 생성된 li 요소
   */
  function createTodoElement(todo) {
    const li = document.createElement("li");
    li.className = "todo-item" + (todo.isDone ? " completed" : "");
    li.dataset.id = todo.id; // 서버 ID 저장 (API 호출용)

    // 체크박스 생성
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "todo-checkbox";
    checkbox.setAttribute("aria-label", "할 일 완료 여부 선택");
    if (todo.isDone) checkbox.checked = true;

    // 제목 span 생성
    const textSpan = document.createElement("span");
    textSpan.className = "todo-text";
    textSpan.textContent = todo.title;

    // 액션 버튼 그룹 생성
    const actionsDiv = document.createElement("div");
    actionsDiv.className = "item-actions";
    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "edit-btn";
    editBtn.setAttribute("aria-label", "할 일 수정");
    editBtn.textContent = "수정";
    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "delete-btn";
    deleteBtn.setAttribute("aria-label", "할 일 삭제");
    deleteBtn.textContent = "삭제";

    // 삭제 버튼 click 이벤트: 서버 DELETE 요청 후 목록 갱신
    deleteBtn.addEventListener("click", async function () {
      const id = li.dataset.id;
      try {
        await deleteTodo(id);
        // 목록 다시 불러오기 (서버 상태와 동기화)
        loadTodos();
      } catch (err) {
        alert("삭제 실패: " + err.message);
      }
    });

    actionsDiv.appendChild(editBtn);
    actionsDiv.appendChild(deleteBtn);

    // li에 자식 요소들 추가
    li.appendChild(checkbox);
    li.appendChild(textSpan);
    li.appendChild(actionsDiv);

    // 체크박스 change 이벤트: 즉시 UI 반영 + 서버 PUT 요청
    checkbox.addEventListener("change", async function () {
      const isDone = checkbox.checked;
      const id = li.dataset.id;

      // 1) 즉시 화면 반영 (span에 completed 클래스 토글)
      if (isDone) {
        li.classList.add("completed");
      } else {
        li.classList.remove("completed");
      }
      updateSummary();

      // 2) 서버에 isDone 반영
      try {
        await updateTodo(id, { isDone });
      } catch (err) {
        // 실패 시 원복
        checkbox.checked = !isDone;
        if (isDone) {
          li.classList.remove("completed");
        } else {
          li.classList.add("completed");
        }
        updateSummary();
        alert("상태 변경 실패: " + err.message);
      }
    });

    return li;
  }

  /** XSS 방지용 HTML 이스케이프 */
  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * 서버에서 전체 목록 조회 후 화면 렌더링
   */
  async function loadTodos() {
    try {
      const res = await fetch("/todos");
      if (!res.ok) throw new Error("목록 조회 실패");
      const todos = await res.json();

      // 기존 목록 비우기 (샘플 데이터 제거)
      todoList.innerHTML = "";

      // 서버 데이터로 렌더링 (최신순 정렬: createdAt 내림차순)
      todos
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .forEach((todo) => {
          const li = createTodoElement(todo);
          todoList.appendChild(li);
        });

      updateSummary();
    } catch (err) {
      console.error("loadTodos 에러:", err);
    }
  }

  /**
   * 신규 할 일 생성 (POST /todos)
   */
  async function createTodo(title) {
    try {
      const res = await fetch("/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error("생성 실패");
      return await res.json();
    } catch (err) {
      console.error("createTodo 에러:", err);
      throw err;
    }
  }

  /**
   * 할 일 수정 (PUT /todos/:id) - title 또는 isDone 부분 업데이트
   */
  async function updateTodo(id, data) {
    try {
      const res = await fetch(`/todos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("수정 실패");
      return await res.json();
    } catch (err) {
      console.error("updateTodo 에러:", err);
      throw err;
    }
  }

  /**
   * 할 일 삭제 (DELETE /todos/:id)
   */
  async function deleteTodo(id) {
    try {
      const res = await fetch(`/todos/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("삭제 실패");
      return await res.json();
    } catch (err) {
      console.error("deleteTodo 에러:", err);
      throw err;
    }
  }

  /**
   * 인라인 수정 모드 진입
   */
  function enterEditMode(item) {
    const textSpan = item.querySelector(".todo-text");
    const actionsDiv = item.querySelector(".item-actions");
    const currentText = textSpan.textContent.trim();

    item.classList.add("is-editing");
    textSpan.style.display = "none";

    let editInput = item.querySelector(".todo-edit-input");
    if (!editInput) {
      editInput = document.createElement("input");
      editInput.type = "text";
      editInput.className = "todo-edit-input";
      editInput.setAttribute("aria-label", "할 일 수정 입력");
      textSpan.parentNode.insertBefore(editInput, actionsDiv);
    }
    editInput.value = currentText;
    editInput.style.display = "block";
    editInput.focus();
    editInput.select();

    // 버튼을 [저장] / [취소]로 전환
    actionsDiv.innerHTML = `
      <button type="button" class="btn-save" aria-label="수정 내용 저장">저장</button>
      <button type="button" class="btn-cancel" aria-label="수정 취소">취소</button>
    `;
  }

  /**
   * 수정 완료 저장 (서버 반영 + UI 갱신)
   */
  async function saveEdit(item) {
    const editInput = item.querySelector(".todo-edit-input");
    const textSpan = item.querySelector(".todo-text");
    const actionsDiv = item.querySelector(".item-actions");
    if (!editInput || !textSpan || !actionsDiv) return;

    const newText = editInput.value.trim();
    if (!newText) return;

    const id = item.dataset.id;
    try {
      await updateTodo(id, { title: newText });
      textSpan.textContent = newText;
    } catch (err) {
      alert("수정 실패: " + err.message);
      return;
    }

    editInput.style.display = "none";
    textSpan.style.display = "";
    item.classList.remove("is-editing");

    // 액션 버튼 복원
    actionsDiv.innerHTML = `
      <button type="button" class="edit-btn" aria-label="할 일 수정">수정</button>
      <button type="button" class="delete-btn" aria-label="할 일 삭제">삭제</button>
    `;
  }

  /**
   * 수정 취소
   */
  function cancelEdit(item) {
    const editInput = item.querySelector(".todo-edit-input");
    const textSpan = item.querySelector(".todo-text");
    const actionsDiv = item.querySelector(".item-actions");
    if (!textSpan || !actionsDiv) return;

    if (editInput) {
      editInput.style.display = "none";
    }
    textSpan.style.display = "";
    item.classList.remove("is-editing");

    actionsDiv.innerHTML = `
      <button type="button" class="edit-btn" aria-label="할 일 수정">수정</button>
      <button type="button" class="delete-btn" aria-label="할 일 삭제">삭제</button>
    `;
  }

  // 1. 페이지 로드 시 목록 조회
  loadTodos();

  // 2. 신규 할 일 추가 폼 제출
  todoForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const text = todoInput.value.trim();
    if (!text) return;

    try {
      const newTodo = await createTodo(text);
      const li = createTodoElement(newTodo);
      // 최신순이므로 맨 위에 추가
      todoList.insertBefore(li, todoList.firstChild);
      todoInput.value = "";
      updateSummary();
    } catch (err) {
      alert("추가 실패: " + err.message);
    }
  });

  // 3. 목록 이벤트 위임 (수정 모드, 저장, 취소)
  todoList.addEventListener("click", async function (e) {
    const target = e.target;
    const item = target.closest(".todo-item");
    if (!item) return;

    const id = item.dataset.id;

    // (1) 수정 버튼 클릭 -> 인라인 수정 모드 진입
    if (target.classList.contains("edit-btn") || target.classList.contains("btn-edit")) {
      enterEditMode(item);
      return;
    }

    // (2) 저장 버튼 클릭
    if (target.classList.contains("btn-save")) {
      await saveEdit(item);
      return;
    }

    // (3) 취소 버튼 클릭
    if (target.classList.contains("btn-cancel")) {
      cancelEdit(item);
      return;
    }
  });

  // 4. 인라인 수정 인풋 키보드 단축키 (Enter = 저장, Escape = 취소)
  todoList.addEventListener("keydown", function (e) {
    if (e.target.classList.contains("todo-edit-input")) {
      const item = e.target.closest(".todo-item");
      if (!item) return;

      if (e.key === "Enter") {
        e.preventDefault();
        saveEdit(item);
      } else if (e.key === "Escape") {
        e.preventDefault();
        cancelEdit(item);
      }
    }
  });
});