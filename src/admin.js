/* eslint-disable no-underscore-dangle */
/* eslint-disable import/no-unresolved */
import express from 'express';
import { catchErrors, ensureLoggedIn } from './utils.js';
import { select, deleteRow, counter } from './db.js';

export const router = express.Router();

async function pagingAdmin(req, res) {
  let { offset = 0, limit = 50 } = req.query;
  offset = Number(offset);
  limit = Number(limit);

  const registrations = await select(offset, limit);
  const regCount = await counter();
  const { username } = req.user;

  const formData = {
    registrations,
  };

  const result = {
    _links: {
      self: {
        href: `/admin/?offset=${offset}&limit=${limit}`,
      },
    },
  };

  if (offset > 0) {
    result._links.prev = {
      href: `/admin/?offset=${offset - limit}&limit=${limit}`,
    };
  }

  if (registrations.length <= limit) {
    result._links.next = {
      href: `/admin/?offset=${Number(offset) + limit}&limit=${limit}`,
    };
  }

  const pageCounter = {
    currentPage: `${(offset / 50) + 1}`,
    lastPage: `${Math.ceil(regCount.count / 50)}`,
  };

  return res.render('users', { formData, result, regCount, pageCounter, username });
}

/**
 * Route til að geta eytt undirskrift
 *
 * @param {object} req Request hlutur
 * @param {object} res Response hlutur
 */
async function deleteSignatures(req, res) {
  const { id } = req.params;

  await deleteRow([id]);

  return res.redirect('/admin');
}

router.post('/delete/:id', ensureLoggedIn, catchErrors(deleteSignatures));
router.get('/', ensureLoggedIn, catchErrors(pagingAdmin));
