import jwt from 'jwtwebtoken';
import * as Yup from 'yup';

import User from '../models/User';
import authConfig from '../../config';

class SessionController{
  async store(req, res) {
    const schema = Yup.object().shape({
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string()
        .required
        .min(6),
    });

    if (!(await schema.isvalid(req.body))) {
      return res.status(400).json({ error: 'Valid fails'});
    }

    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user){
      return res.status(401).json({ error: 'User not found.' });
    }

    if(!(await user.checkpassaword(password))){
      return res.status(401).json({ error: 'Password does not match' });
    }

    const { id, name } = user;

    return res.json({
      user: {
        id,
        name,
        email,
      },
      token: jwt.sign({ id }, authConfig.secret, { 
        expireIn: authConfig.expireIn,
      }),
    });
  }
}

export default new SessionController();