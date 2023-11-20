import "../index.css";

import Footer from "./Footer.jsx";
import Main from "./Main.jsx";
import PopupWithForm from "./PopupWithForm.jsx";
import EditProfilePopup from "./EditProfilePopup.jsx";
import EditAvatarPopup from "./EditAvatarPopup.jsx";
import AddPlacePopup from "./AddPlacePopup.jsx";
import ImagePopup from "./ImagePopup.jsx";
import InfoTooltip from "./InfoTooltip.jsx";
import React from "react";
import apiRes from "../utils/Api.js";
import { CurrentUserContext } from "../contexts/CurrentUserContext.jsx";
import { CardContext } from "../contexts/CardContext.jsx";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login.jsx";
import Register from "./Register.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import * as auth from './Auth.jsx';
import {Link, useNavigate} from 'react-router-dom';
function App() {
  const [isEditProfilePopupOpen, setEditProfilePopupOpen] =
    React.useState(false);
  const [isAddPlacePopupOpen, setAddPlacePopupOpen] = React.useState(false);
  const [isEditAvatarPopupOpen, setEditAvatarPopupOpen] = React.useState(false);
  const [selectedCard, setselectedCard] = React.useState(null);
  const [isInfoTooltipOpen, setInfoTooltipOpen] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState({
    name: "",
    avatar: "",
    _id: "",
    about: "",
  });

  const [cards, setCards] = React.useState([]);

  React.useEffect(() => {
    apiRes
      .getMethodCards()
      .then((res) => {
        setCards(res);
      })
      .catch((err) => {
        //попадаем сюда если один из промисов завершатся ошибкой
        console.log(err);
      });
  }, []);

  function handleCardLike(card) {
    // Снова проверяем, есть ли уже лайк на этой карточке
    const isLiked = card.likes.some((i) => i._id === currentUser._id);

    // Отправляем запрос в API и получаем обновлённые данные карточки
    apiRes
      .changeLikeCardStatus(card._id, isLiked)
      .then((newCard) => {
        setCards((state) =>
          state.map((c) => (c._id === card._id ? newCard : c))
        );
      })
      .catch((err) => {
        //попадаем сюда если один из промисов завершатся ошибкой
        console.log(err);
      });
  }
  function handleCardDelete(card) {
    // Отправляем запрос в API и получаем обновлённые данные
    apiRes
      .deleteMethod(card._id)
      .then(() => {
        setCards((state) => state.filter((c) => c._id != card._id));
      })
      .catch((err) => {
        //попадаем сюда если один из промисов завершатся ошибкой
        console.log(err);
      });
  }

  function handleEditAvatarClick() {
    setEditAvatarPopupOpen(true);
  }
  function handleEditProfileClick() {
    setEditProfilePopupOpen(true);
  }
  function handleAddPlaceClick() {
    setAddPlacePopupOpen(true);
  }

  function handleCardClick(card) {
    setselectedCard(card);
  }

  React.useEffect(() => {
    apiRes
      .getMethodUser()
      .then((res) => {
        setCurrentUser({
          name: res.name,
          avatar: res.avatar,
          _id: res._id,
          about: res.about,
        });
      })
      .catch((err) => {
        //попадаем сюда если один из промисов завершатся ошибкой
        console.log(err);
      });
  }, []);

  function closeAllPopups() {
    setEditAvatarPopupOpen(false);
    setEditProfilePopupOpen(false);
    setAddPlacePopupOpen(false);
    setselectedCard(null);
    setInfoTooltipOpen(false);
  }

  function handleUpdateUser(name, job) {
    apiRes
      .setUserInfo(name, job)
      .then((res) => {
        setCurrentUser({
          name: res.name,
          avatar: res.avatar,
          _id: res._id,
          about: res.about,
        });
      })
      .then(() => {
        closeAllPopups();
      })
      .catch((err) => {
        //попадаем сюда если один из промисов завершатся ошибкой
        console.log(err);
      });
  }

  function handleUpdateAvatar(avatar) {
    apiRes
      .patchAvatar(avatar)
      .then((res) => {
        setCurrentUser({
          name: res.name,
          avatar: res.avatar,
          _id: res._id,
          about: res.about,
        });
      })
      .then(() => {
        closeAllPopups();
      })
      .catch((err) => {
        //попадаем сюда если один из промисов завершатся ошибкой
        console.log(err);
      });
  }

  function handleAddPlaceSubmit(place, link) {
    apiRes
      .postCard(place, link)
      .then((res) => {
        setCards([res, ...cards]);
      })
      .then(() => {
        closeAllPopups();
      })
      .catch((err) => {
        //попадаем сюда если один из промисов завершатся ошибкой
        console.log(err);
      });
  }

  const [loggedIn, setLoggedIn] = React.useState(false);
  const navigate = useNavigate();
  const handleLogin = (e) => {
    e.preventDefault();
    setLoggedIn(true)
} 

React.useEffect(() => {
tokenCheck();
}, [])

const tokenCheck = () => {
  // если у пользователя есть токен в localStorage,
  // эта функция проверит валидность токена
    const jwt = localStorage.getItem('jwt');
  if (jwt){
    // проверим токен
            auth.checkToken(jwt).then((res) => {
        if (res){
          setCurrentUser({
            name: res.email,
            avatar: '',
            _id: res._id,
            about: res.email,
          });
                    // авторизуем пользователя
          setLoggedIn(true);
          navigate("/main", {replace: true})
        }
      });
  }
}  

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <CardContext.Provider value={cards}>
        <div className="App">
          <div className="body">
            <div className="page">
              
              <Routes>
                <Route
                  path="/"
                  element={
                    <ProtectedRoute
                      element={Main}
                      loggedIn={loggedIn}
                      onEditProfile={handleEditProfileClick}
                      onAddPlace={handleAddPlaceClick}
                      onEditAvatar={handleEditAvatarClick}
                      onCardClick={handleCardClick}
                      onCardLike={handleCardLike}
                      onCardDelete={handleCardDelete}
                    />
                  }
                />
                <Route path="/sign-in" element={<Login handleLogin={handleLogin} />} />
                <Route path="/sign-up" element={<Register />} />
              </Routes>
              <Footer />
            </div>
            {/*редактирование профиля*/}
            <EditProfilePopup
              isOpen={isEditProfilePopupOpen}
              closeAllPopups={closeAllPopups}
              onUpdateUser={handleUpdateUser}
            />

            {/*редактирование аватара*/}
            <EditAvatarPopup
              isOpen={isEditAvatarPopupOpen}
              closeAllPopups={closeAllPopups}
              onUpdateAvatar={handleUpdateAvatar}
            />

            {/*Добавление новой карточки*/}
            <AddPlacePopup
              isOpen={isAddPlacePopupOpen}
              closeAllPopups={closeAllPopups}
              onUpdateCards={handleAddPlaceSubmit}
            />

            <ImagePopup card={selectedCard} closeAllPopups={closeAllPopups} />
            <InfoTooltip closeAllPopups={closeAllPopups} isOpen={isInfoTooltipOpen}/>
          </div>
        </div>
      </CardContext.Provider>
    </CurrentUserContext.Provider>
  );
}

export default App;
